(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Toast ---------- */
  // Toasts carry failures, undo windows and results the reader can't see happen (product patterns dial).
  const toast = $("#toast");
  const toastText = $(".toast__text", toast);
  const toastAction = $(".toast__action", toast);
  let toastTimer;
  let toastUndo = null;
  function hideToast() {
    toast.classList.remove("is-visible");
    toastUndo = null;
  }
  function showToast(text, undo) {
    toastText.textContent = text;
    toastUndo = undo || null;
    toastAction.hidden = !undo;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, undo ? 6000 : 2600);
  }
  toastAction.addEventListener("click", () => {
    const undo = toastUndo;
    clearTimeout(toastTimer);
    hideToast();
    if (undo) undo();
  });

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
      status.textContent = "Saved just now";
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
  // An error clears as soon as the value changes; the check runs again on blur and on save.
  email.addEventListener("input", () => {
    if (email.closest(".field--invalid")) setError(email, "");
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
    checkRules();
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
    const rulesOk = checkRules();
    if (!rulesOk) {
      ensureMsg(pwNew);
      setError(pwNew, pwNew.value ? "Your new password doesn’t meet every requirement yet." : "Choose a new password.");
    } else {
      setError(pwNew, "");
    }
    if (!pwConfirm.value) setError(pwConfirm, "Confirm your new password.");
    else checkConfirm();

    const firstInvalid = $(".field--invalid input", pwForm);
    if (firstInvalid) {
      status.className = "status is-error";
      status.textContent = "Check the fields above.";
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
        status.textContent = "Password updated";
      });
    });
  });
  pwForm.addEventListener("reset", () => {
    setTimeout(() => {
      [pwCurrent, pwNew, pwConfirm].forEach((i) => setError(i, ""));
    });
  });

  /* ---------- Connected accounts ---------- */
  function renderConnection(row, connected) {
    const badge = $(".badge", row);
    const btn = $(".js-connect", row);
    row.dataset.connected = String(connected);
    badge.className = connected ? "badge badge--ok" : "badge";
    badge.textContent = connected ? "Connected" : "Not connected";
    btn.className = connected ? "btn btn--secondary btn--sm js-connect" : "btn btn--primary btn--sm js-connect";
    btn.textContent = connected ? "Disconnect" : "Connect";
  }
  $$(".js-connect").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".connection");
      const service = btn.dataset.service;
      if (row.dataset.connected === "true") {
        // Reversible: act now, offer Undo, no dialog.
        renderConnection(row, false);
        showToast(`${service} disconnected`, () => renderConnection(row, true));
        return;
      }
      // Connecting is the provider's answer, so it waits for it; the row itself shows the result.
      btn.classList.add("is-loading");
      setTimeout(() => {
        btn.classList.remove("is-loading");
        renderConnection(row, true);
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
  const matches = () => confirmInput.value.trim().toLowerCase() === "delete my account";
  let deleting = false;
  confirmInput.addEventListener("input", () => {
    confirmBtn.disabled = !matches();
  });
  // Held open while the deletion runs, so a failure has somewhere to be reported.
  $("#delete-form").addEventListener("submit", (e) => {
    if (e.submitter !== confirmBtn) return;
    e.preventDefault();
    if (!matches() || deleting) return;
    deleting = true;
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Deleting…";
    $$("#delete-form .btn--ghost").forEach((b) => (b.disabled = true));
    setTimeout(() => {
      deleting = false;
      confirmBtn.textContent = "Delete account";
      $$("#delete-form .btn--ghost").forEach((b) => (b.disabled = false));
      dialog.close("confirm");
    }, 800);
  });
  dialog.addEventListener("cancel", (e) => {
    if (deleting) e.preventDefault();
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "confirm") showToast("Account scheduled for deletion. Check your email to finish.");
  });

  /* ---------- Search shortcut: the ⌘K hint in the search field works ---------- */
  const search = $(".search input");
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && search && search.offsetParent) {
      e.preventDefault();
      search.focus();
    }
  });

  /* ---------- Section nav highlight ---------- */
  const sidenav = $(".sidenav");
  const marker = $(".sidenav__marker");
  const links = $$(".sidenav a");
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  function placeMarker() {
    const a = $(".sidenav a.is-active");
    if (!a || !marker) return;
    marker.style.setProperty("--marker-y", a.offsetTop + "px");
    marker.style.setProperty("--marker-h", a.offsetHeight + "px");
  }
  function setActive(id) {
    links.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    placeMarker();
  }
  // The marker is placed before it is shown, and animates only after that, so it never flies in on load.
  if (marker) {
    placeMarker();
    sidenav.classList.add("has-marker");
    requestAnimationFrame(() => requestAnimationFrame(() => sidenav.classList.add("is-ready")));
    window.addEventListener("resize", placeMarker, { passive: true });
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
