import { useEffect, useRef, useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function SignupMenu() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [userFocused, setUserFocused] = useState(false);
  const [birthFocused, setBirthFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [menuTop, setMenuTop] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mide la posición real del botón para que el panel aparezca justo debajo,
  // sin importar dónde viva este componente dentro del header.
  const positionMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuTop(rect.bottom + 8);
    }
  };

  useEffect(() => {
    if (!open) return;
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!username.trim()) {
      setError("Ingresá tu usuario.");
      return;
    }
    if (!birthDate) {
      setError("Ingresá tu fecha de nacimiento.");
      return;
    }

    // Validación simple de edad mínima (opcional, ajustable)
    const birth = new Date(birthDate);
    const age = new Date().getFullYear() - birth.getFullYear();
    if (age < 18) {
      setError("Debés ser mayor de 18 años para abrir una cuenta.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Este endpoint debe vivir en tu backend y conectarse
      // a la base de datos ahí, nunca desde el frontend directo.
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, birthDate, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "No se pudo crear la cuenta.");
      }

      const data = await res.json();
      console.log("Registro exitoso:", data);
      setSuccess(true);
      setUsername("");
      setBirthDate("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const userFloated = userFocused || username.length > 0;
  const birthFloated = birthFocused || birthDate.length > 0;
  const passFloated = passFocused || password.length > 0;
  const confirmFloated = confirmFocused || confirmPassword.length > 0;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-1.5 rounded-xl bg-brick px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brick-dark"
      >
        <UserPlus className="h-4 w-4" />
        Abrir cuenta
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* En móvil: fixed, ancho completo, justo debajo del botón (medido con menuTop).
              Desde sm: vuelve a ser un panel flotante anclado a la derecha del botón. */}
          <div
            style={{ ["--menu-top" as any]: `${menuTop}px` }}
            className="fixed left-3 right-3 top-[var(--menu-top)] z-50 rounded-2xl border border-ink/10 bg-paper p-6 shadow-xl sm:!top-auto sm:absolute sm:left-auto sm:right-0 sm:mt-3 sm:w-80 sm:p-5"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="relative">
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                  className="peer w-full border-b-2 border-ink/15 bg-transparent pb-1.5 pt-4 text-sm text-ink outline-none transition-colors duration-300 focus:border-[#8B4B6B]"
                  autoComplete="username"
                />
                <label
                  htmlFor="signup-username"
                  className={`pointer-events-none absolute left-0 transition-all duration-300 ease-out ${
                    userFloated
                      ? "-top-3 text-[11px] font-medium tracking-wide text-[#8B4B6B]"
                      : "top-3 text-sm text-ink/40"
                  }`}
                >
                  Usuario
                </label>
              </div>

              <div className="relative">
                <input
                  id="signup-birthdate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  onFocus={() => setBirthFocused(true)}
                  onBlur={() => setBirthFocused(false)}
                  className={`peer w-full border-b-2 border-ink/15 bg-transparent pb-1.5 pt-4 text-sm outline-none transition-colors duration-300 focus:border-[#4B6C8B] ${
                    birthFloated ? "text-ink" : "text-transparent"
                  }`}
                />
                <label
                  htmlFor="signup-birthdate"
                  className={`pointer-events-none absolute left-0 transition-all duration-300 ease-out ${
                    birthFloated
                      ? "-top-3 text-[11px] font-medium tracking-wide text-[#4B6C8B]"
                      : "top-3 text-sm text-ink/40"
                  }`}
                >
                  Fecha de nacimiento
                </label>
              </div>

              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  className="peer w-full border-b-2 border-ink/15 bg-transparent pb-1.5 pr-8 pt-4 text-sm text-ink outline-none transition-colors duration-300 focus:border-[#8B4B6B]"
                  autoComplete="new-password"
                />
                <label
                  htmlFor="signup-password"
                  className={`pointer-events-none absolute left-0 transition-all duration-300 ease-out ${
                    passFloated
                      ? "-top-3 text-[11px] font-medium tracking-wide text-[#8B4B6B]"
                      : "top-3 text-sm text-ink/40"
                  }`}
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 transition-colors hover:text-ink"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  className="peer w-full border-b-2 border-ink/15 bg-transparent pb-1.5 pr-8 pt-4 text-sm text-ink outline-none transition-colors duration-300 focus:border-[#4B6C8B]"
                  autoComplete="new-password"
                />
                <label
                  htmlFor="signup-confirm"
                  className={`pointer-events-none absolute left-0 transition-all duration-300 ease-out ${
                    confirmFloated
                      ? "-top-3 text-[11px] font-medium tracking-wide text-[#4B6C8B]"
                      : "top-3 text-sm text-ink/40"
                  }`}
                >
                  Confirmar contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 transition-colors hover:text-ink"
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-brick">{error}</p>}
              {success && (
                <p className="text-xs text-green-700">¡Cuenta creada con éxito!</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-brick px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brick-dark disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}