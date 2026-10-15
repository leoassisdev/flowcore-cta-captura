// CtaCaptura · Criado por FlowCore Soluções LTDA · flowcoresolucoes.com.br/codigos · licença MIT
// CTA final com captura de lead: nome, e-mail corporativo (bloqueia webmail)
// e WhatsApp com máscara brasileira, validação no cliente e estado de sucesso.
// Props: tema ("claro" padrão | "escuro"), accent, eyebrow, title, subtitle,
// beneficios, botao, onSubmit, exigirEmailCorporativo.
// Requisitos: React 18+ e Tailwind CSS 3+. Zero dependências. Sem chamadas de rede: use a prop onSubmit.

import { useId, useState, type CSSProperties, type FormEvent } from "react";

export type LeadCaptura = { nome: string; email: string; whatsapp: string };

type Tema = "claro" | "escuro";

type Props = {
  /** Tema visual. Padrão "claro". */
  tema?: Tema;
  /** Cor de destaque (qualquer cor CSS). */
  accent?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  beneficios?: string[];
  botao?: string;
  /** Recebe o lead validado. Pode ser assíncrona; se lançar erro, mostra a mensagem. */
  onSubmit?: (lead: LeadCaptura) => void | Promise<void>;
  /** Exige e-mail de domínio próprio (bloqueia gmail, hotmail etc.). */
  exigirEmailCorporativo?: boolean;
};

// Paleta do tema aplicada como CSS vars na raiz (não depende do tailwind.config).
const TEMAS: Record<Tema, Record<string, string>> = {
  claro: {
    "--fc-bg": "#F7F8FB", "--fc-surface": "#FFFFFF", "--fc-surface-2": "#F1F4F9",
    "--fc-border": "#E3E8F0", "--fc-border-strong": "#CBD3E1",
    "--fc-text": "#0B1220", "--fc-muted": "#4B5565", "--fc-subtle": "#8A94A6",
    "--fc-pos": "#059669", "--fc-neg": "#E11D48", "--fc-warn": "#D97706",
    "--fc-shadow": "0 1px 2px rgba(16,24,40,.06), 0 12px 32px -16px rgba(16,24,40,.18)",
    "--fc-text-2": "#1F2937", "--fc-card": "#FFFFFF", "--fc-neg-soft": "#BE123C",
    "--fc-card-shadow": "0 1px 2px rgba(16,24,40,.06), 0 24px 48px -20px rgba(16,24,40,.22)", "--fc-glow": "0.18",
  },
  escuro: {
    "--fc-bg": "#0B0F17", "--fc-surface": "rgba(255,255,255,0.03)", "--fc-surface-2": "rgba(255,255,255,0.06)",
    "--fc-border": "rgba(255,255,255,0.10)", "--fc-border-strong": "rgba(255,255,255,0.25)",
    "--fc-text": "#FFFFFF", "--fc-muted": "rgba(255,255,255,0.60)", "--fc-subtle": "rgba(255,255,255,0.40)",
    "--fc-pos": "#34D399", "--fc-neg": "#FB7185", "--fc-warn": "#FBBF24",
    "--fc-shadow": "0 24px 48px -24px rgba(0,0,0,.6)",
    "--fc-text-2": "rgba(255,255,255,0.80)", "--fc-card": "rgba(11,15,23,0.80)", "--fc-neg-soft": "#FECDD3",
    "--fc-card-shadow": "0 25px 50px -12px rgba(0,0,0,.4)", "--fc-glow": "0.25",
  },
};

const CORES = ["var(--accent)", "#7C3AED", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"];

const WEBMAIL = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yahoo.com.br", "live.com", "icloud.com", "bol.com.br", "uol.com.br"];

/** (11) 98765-4321 ou (11) 3456-7890 */
function mascaraWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type Erros = Partial<Record<keyof LeadCaptura, string>>;

export default function CtaCaptura({
  tema = "claro",
  accent = "#0057FF",
  eyebrow = "Diagnóstico gratuito",
  title = "Descubra quanto sua operação está deixando na mesa",
  subtitle = "Em 30 minutos, um especialista mapeia seus gargalos e mostra o retorno estimado da automação. Sem compromisso.",
  beneficios = ["Relatório com ROI estimado", "Resposta em até 1 dia útil", "Sem custo e sem fidelidade"],
  botao = "Quero meu diagnóstico",
  onSubmit,
  exigirEmailCorporativo = true,
}: Props) {
  const id = useId();
  const [dados, setDados] = useState<LeadCaptura>({ nome: "", email: "", whatsapp: "" });
  const [erros, setErros] = useState<Erros>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [mensagemErro, setMensagemErro] = useState("");
  const escuro = tema === "escuro";

  const validar = (d: LeadCaptura): Erros => {
    const e: Erros = {};
    if (d.nome.trim().split(/\s+/).length < 2) e.nome = "Informe nome e sobrenome.";
    const email = d.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "E-mail inválido.";
    else if (exigirEmailCorporativo && WEBMAIL.includes(email.split("@")[1])) e.email = "Use seu e-mail corporativo.";
    const dig = d.whatsapp.replace(/\D/g, "");
    if (dig.length !== 11 || dig[2] !== "9") e.whatsapp = "WhatsApp com DDD, ex.: (11) 98765-4321.";
    return e;
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validar(dados);
    setErros(e);
    if (Object.keys(e).length) {
      const primeiro = ev.currentTarget.querySelector<HTMLInputElement>(`[name="${Object.keys(e)[0]}"]`);
      primeiro?.focus();
      return;
    }
    setEstado("enviando");
    try {
      await onSubmit?.({ ...dados, nome: dados.nome.trim(), email: dados.email.trim().toLowerCase() });
      setEstado("ok");
    } catch (err) {
      setMensagemErro(err instanceof Error ? err.message : "Não foi possível enviar. Tente novamente.");
      setEstado("erro");
    }
  };

  const campo = (nome: keyof LeadCaptura) =>
    `h-12 w-full rounded-xl border px-4 text-sm text-[var(--fc-text)] placeholder:text-[var(--fc-subtle)] transition-colors focus:outline-none ${
      escuro ? "bg-[var(--fc-surface)]" : "bg-[var(--fc-surface-2)] focus:bg-[var(--fc-surface)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
    } ${
      erros[nome]
        ? "border-[color-mix(in_srgb,var(--fc-neg)_60%,transparent)] focus:border-[var(--fc-neg)]"
        : "border-[var(--fc-border)] hover:border-[var(--fc-border-strong)] focus:border-[var(--accent)]"
    }`;

  const atualizar = (k: keyof LeadCaptura, v: string) => {
    setDados((d) => ({ ...d, [k]: k === "whatsapp" ? mascaraWhatsapp(v) : v }));
    if (erros[k]) setErros((e) => ({ ...e, [k]: undefined }));
  };

  return (
    <section
      style={{ ...TEMAS[tema], "--accent": accent } as CSSProperties}
      className="relative isolate overflow-hidden bg-[var(--fc-bg)] px-6 py-20 text-[var(--fc-text)] sm:py-28 lg:px-8"
    >
      <div
        className={`relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--fc-border)] p-6 sm:p-12 lg:p-16 ${
          escuro ? "bg-[var(--fc-surface)]" : "bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_9%,white)] via-white to-[color-mix(in_srgb,#7C3AED_8%,white)] shadow-[var(--fc-shadow)]"
        }`}
      >
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[var(--accent)] opacity-[var(--fc-glow)] blur-[100px]" />
        {!escuro && <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-72 w-72 rounded-full bg-[#EC4899] opacity-[0.10] blur-[100px]" />}
        {!escuro && (
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(color-mix(in_srgb,var(--accent)_14%,transparent)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        )}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="mt-5 text-pretty text-[var(--fc-muted)] sm:text-lg">{subtitle}</p>
            <ul className="mt-8 space-y-3">
              {beneficios.map((b, i) => (
                <li key={b} className="flex items-center gap-3 text-sm text-[var(--fc-text-2)]">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${escuro ? "bg-[var(--fc-surface-2)] text-[var(--accent)]" : "text-white"}`}
                    style={escuro ? undefined : { background: CORES[i % CORES.length], boxShadow: `0 6px 14px -6px ${CORES[i % CORES.length]}` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--fc-border)] bg-[var(--fc-card)] p-5 shadow-[var(--fc-card-shadow)] sm:p-8">
            {estado === "ok" ? (
              <div role="status" className="py-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] shadow-[0_0_40px_-6px_var(--accent)] motion-safe:animate-[ctaPop_.5s_cubic-bezier(.16,1,.3,1)_both]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">Recebemos, {dados.nome.trim().split(" ")[0]}.</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--fc-muted)]">
                  Um especialista vai chamar você no WhatsApp {dados.whatsapp} em até 1 dia útil.
                </p>
              </div>
            ) : (
              <form noValidate onSubmit={enviar} className="space-y-5" aria-describedby={`${id}-lgpd`}>
                {(
                  [
                    { k: "nome", label: "Nome completo", type: "text", ph: "Ana Ribeiro", ac: "name", im: "text" },
                    { k: "email", label: "E-mail corporativo", type: "email", ph: "ana@suaempresa.com.br", ac: "email", im: "email" },
                    { k: "whatsapp", label: "WhatsApp", type: "tel", ph: "(11) 98765-4321", ac: "tel-national", im: "tel" },
                  ] as const
                ).map((c) => (
                  <div key={c.k}>
                    <label htmlFor={`${id}-${c.k}`} className="mb-2 block text-sm font-medium text-[var(--fc-text-2)]">
                      {c.label}
                    </label>
                    <input
                      id={`${id}-${c.k}`}
                      name={c.k}
                      type={c.type}
                      inputMode={c.im}
                      autoComplete={c.ac}
                      placeholder={c.ph}
                      value={dados[c.k]}
                      onChange={(e) => atualizar(c.k, e.target.value)}
                      aria-invalid={!!erros[c.k]}
                      aria-describedby={erros[c.k] ? `${id}-${c.k}-erro` : undefined}
                      className={campo(c.k)}
                    />
                    {erros[c.k] && (
                      <p id={`${id}-${c.k}-erro`} className="mt-1.5 text-xs text-[var(--fc-neg)]">
                        {erros[c.k]}
                      </p>
                    )}
                  </div>
                ))}

                {estado === "erro" && (
                  <p role="alert" className="rounded-lg border border-[color-mix(in_srgb,var(--fc-neg)_30%,transparent)] bg-[color-mix(in_srgb,var(--fc-neg)_10%,transparent)] px-3 py-2 text-xs text-[var(--fc-neg-soft)]">
                    {mensagemErro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={estado === "enviando"}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_var(--accent)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60"
                >
                  {estado === "enviando" && (
                    <span aria-hidden className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" />
                  )}
                  {estado === "enviando" ? "Enviando..." : botao}
                </button>
                <p id={`${id}-lgpd`} className="text-center text-[11px] leading-relaxed text-[var(--fc-subtle)]">
                  Seus dados são usados só para este contato, conforme a LGPD. Sem spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-[11px] text-[var(--fc-subtle)]">
        <a href="https://flowcoresolucoes.com.br/codigos" target="_blank" rel="noopener" className="transition-colors hover:text-[var(--fc-text)]">
          Criado por FlowCore Soluções LTDA
        </a>
      </p>

      <style>{`@keyframes ctaPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </section>
  );
}
