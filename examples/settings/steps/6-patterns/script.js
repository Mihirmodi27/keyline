(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Toast ---------- */
  /* Toasts are for failures, undo windows and results the reader can't see happen;
     a save confirms in place, in the form's own status line. */
  const toast = $("#toast");
  let toastTimer;
  function hideToast() { toast.classList.remove("is-visible"); }
  function showToast(text, action) {
    toast.textContent = text;
    if (action) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "toast__action";
      btn.textContent = action.label;
      btn.addEventListener("click", () => { hideToast(); action.run(); });
      toast.append(" ", btn);
    }
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? 6000 : 2600);
  }

  /* ---------- Field helpers ---------- */
  function setError(input, message) {
    const field = input.closest(".field");
    const msg = field.querySelector(".msg");
    field.classList.toggle("field--invalid", !!message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (msg) msg.textContent = message || "";
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validateEmail(input) {
    const v = input.value.trim();
    if (!v) return "Email is required.";
    if (!EMAIL_RE.test(v)) return "Enter a valid email address, like name@company.com.";
    return "";
  }

  function fakeSave(button, status, done) {
    button.classList.add("is-loading");
    button.disabled = true;
    status.className = "status";
    status.textContent = "Saving…";
    setTimeout(() => {
      button.classList.remove("is-loading");
      button.disabled = false;
      status.className = "status is-ok";
      status.textContent = "✓ Saved just now";
      done && done();
    }, 800);
  }

  /* ---------- Dirty tracking ---------- */
  $$(".js-form").forEach((form) => {
    const status = $(".status", form);
    form.addEventListener("input", () => {
      status.className = "status is-dirty";
      status.textContent = "Unsaved changes";
    });
    form.addEventListener("reset", () => {
      setTimeout(() => {
        status.className = "status";
        status.textContent = "";
        $$("input", form).forEach((i) => {
          if (i.closest(".field--invalid") && i.id !== "email") setError(i, "");
        });
        const email = $("#email", form);
        if (email) setError(email, validateEmail(email));
      });
    });
  });

  /* ---------- Profile ---------- */
  const profile = $('[data-form="profile"]');
  const email = $("#email");
  const fullName = $("#full-name");
  const avatar = $("#avatar");

  function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }

  email.addEventListener("blur", () => setError(email, validateEmail(email)));
  email.addEventListener("input", () => {
    if (email.closest(".field--invalid")) setError(email, validateEmail(email));
  });
  fullName.addEventListener("input", () => {
    if (!avatar.style.backgroundImage) avatar.textContent = initials(fullName.value);
    if (fullName.value.trim()) setError(fullName, "");
  });

  profile.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $(".status", profile);
    const emailErr = validateEmail(email);
    setError(email, emailErr);
    if (!fullName.value.trim()) {
      ensureMsg(fullName);
      setError(fullName, "Full name is required.");
    }
    const firstInvalid = $(".field--invalid input", profile);
    if (firstInvalid) {
      status.className = "status is-error";
      status.textContent = "Fix the highlighted field to save.";
      firstInvalid.focus();
      return;
    }
    fakeSave($('[type="submit"]', profile), status);
  });

  function ensureMsg(input) {
    const field = input.closest(".field");
    if (!field.querySelector(".msg")) {
      const p = document.createElement("p");
      p.className = "msg";
      p.id = input.id + "-msg";
      field.appendChild(p);
      input.setAttribute("aria-describedby", p.id);
    }
  }

  const photoInput = $("#photo-input");
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast("That photo is over 4 MB. Try a smaller one.");
      photoInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      avatar.style.background = `center / cover no-repeat url("${reader.result}")`;
      avatar.style.backgroundImage = `url("${reader.result}")`;
      avatar.textContent = "";
      avatar.classList.remove("is-empty");
      profile.dispatchEvent(new Event("input"));
    };
    reader.readAsDataURL(file);
  });
  $("#photo-remove").addEventListener("click", () => {
    avatar.style.background = "";
    avatar.style.backgroundImage = "";
    avatar.textContent = initials(fullName.value);
    photoInput.value = "";
    profile.dispatchEvent(new Event("input"));
  });

  /* ---------- Notifications ---------- */
  const notif = $('[data-form="notifications"]');
  notif.addEventListener("change", () => notif.dispatchEvent(new Event("input")));
  notif.addEventListener("submit", (e) => {
    e.preventDefault();
    fakeSave($('[type="submit"]', notif), $(".status", notif));
  });

  /* ---------- Password ---------- */
  const pwForm = $('[data-form="password"]');
  const pwCurrent = $("#pw-current");
  const pwNew = $("#pw-new");
  const pwConfirm = $("#pw-confirm");
  const strength = $(".strength", pwForm);
  const rules = {
    length: (v) => v.length >= 12,
    case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    number: (v) => /[\d\W_]/.test(v),
  };

  function checkRules() {
    const v = pwNew.value;
    let met = 0;
    $$(".rules li", pwForm).forEach((li) => {
      const ok = rules[li.dataset.rule](v);
      li.classList.toggle("is-met", ok);
      if (ok) met++;
    });
    let score = 0;
    if (v) score = Math.min(4, met + (v.length >= 16 ? 1 : 0)) || 1;
    strength.dataset.score = score;
    return met === Object.keys(rules).length;
  }

  pwNew.addEventListener("input", () => {
    const ok = checkRules();
    if (ok && pwNew.closest(".field--invalid")) setError(pwNew, "");
    if (pwConfirm.value) checkConfirm();
  });
  pwConfirm.addEventListener("input", () => {
    if (pwConfirm.closest(".field--invalid")) checkConfirm();
  });
  pwConfirm.addEventListener("blur", () => pwConfirm.value && checkConfirm());

  function checkConfirm() {
    const err = pwConfirm.value !== pwNew.value ? "Passwords don’t match." : "";
    setError(pwConfirm, err);
    pwConfirm.closest(".field").classList.toggle("field--valid", !err && !!pwConfirm.value);
    return !err;
  }

  $$("[data-reveal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.reveal);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  pwForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $(".status", pwForm);
    setError(pwCurrent, pwCurrent.value ? "" : "Enter your current password.");
    // The rules are this field's hint, so its error shows on them rather than in a line beside them
    const rulesOk = checkRules();
    pwNew.closest(".field").classList.toggle("field--invalid", !rulesOk);
    pwNew.setAttribute("aria-invalid", rulesOk ? "false" : "true");
    if (!pwConfirm.value) setError(pwConfirm, "Confirm your new password.");
    else checkConfirm();

    const firstInvalid = $(".field--invalid input", pwForm);
    if (firstInvalid) {
      status.className = "status is-error";
      status.textContent = "Fix the highlighted fields to update your password.";
      firstInvalid.focus();
      return;
    }
    fakeSave($('[type="submit"]', pwForm), status, () => {
      pwForm.reset();
      setTimeout(() => {
        checkRules();
        strength.dataset.score = 0;
        pwConfirm.closest(".field").classList.remove("field--valid");
        status.className = "status is-ok";
        status.textContent = "✓ Password updated";
      });
    });
  });
  pwForm.addEventListener("reset", () => {
    setTimeout(() => {
      [pwCurrent, pwNew, pwConfirm].forEach((i) => setError(i, ""));
    });
  });

  /* ---------- Connected accounts ---------- */
  function setConnected(row, on) {
    const badge = $(".badge", row);
    const btn = $(".js-connect", row);
    row.dataset.connected = String(on);
    badge.className = on ? "badge badge--ok" : "badge";
    badge.textContent = on ? "Connected" : "Not connected";
    btn.className = on ? "btn btn--secondary btn--sm js-connect" : "btn btn--primary btn--sm js-connect";
    btn.textContent = on ? "Disconnect" : "Connect";
  }
  $$(".js-connect").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".connection");
      const service = btn.dataset.service;
      const connected = row.dataset.connected === "true";
      btn.classList.add("is-loading");
      setTimeout(() => {
        btn.classList.remove("is-loading");
        setConnected(row, !connected);
        // Disconnecting is reversible, so it asks nothing and offers Undo
        if (connected) showToast(`${service} disconnected`, { label: "Undo", run: () => setConnected(row, true) });
      }, 700);
    });
  });

  /* ---------- Danger zone ---------- */
  const dialog = $("#delete-dialog");
  const confirmInput = $("#delete-confirm");
  const confirmBtn = $("#delete-confirm-btn");
  $("#delete-open").addEventListener("click", () => {
    confirmInput.value = "";
    confirmBtn.disabled = true;
    if (typeof dialog.showModal === "function") dialog.showModal();
    confirmInput.focus();
  });
  confirmInput.addEventListener("input", () => {
    confirmBtn.disabled = confirmInput.value.trim().toLowerCase() !== "delete my account";
  });
  // Held open, with a pending label, until the deletion is accepted
  $("#delete-form").addEventListener("submit", (e) => {
    if (e.submitter !== confirmBtn) return;
    e.preventDefault();
    confirmBtn.classList.add("is-loading");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Deleting…";
    setTimeout(() => {
      confirmBtn.classList.remove("is-loading");
      confirmBtn.textContent = "Delete account";
      dialog.close("confirm");
      showToast("Account scheduled for deletion. Check your email to finish.");
    }, 900);
  });

  /* ---------- ⌘K focuses search, as its hint promises ---------- */
  const search = $(".search input");
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && search.offsetParent) {
      e.preventDefault();
      search.focus();
    }
  });

  /* ---------- Section nav highlight ---------- */
  const links = $$(".sidenav a");
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  function setActive(id) {
    links.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const first = sections.find((s) => visible.get(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-90px 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }
  links.forEach((a) => a.addEventListener("click", () => setActive(a.getAttribute("href").slice(1))));
})();
