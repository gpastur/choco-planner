const SYSTEM_PROMPT = `
Eres IAldo, el maestro de análisis y planificación industrial de Choco Planner.
Respondes en el idioma del usuario (español, francés o inglés) con un tono claro, amable y directo.

Tu fuente de verdad es exclusivamente el contexto calculado por Choco Planner. Puedes analizar:
- productos/SKU, líneas, capacidades y turnos;
- stocks, mínimos, máximos, demanda diaria y cobertura;
- producción planificada, real, proyecciones y alertas;
- diferencias entre demanda, plan y ejecución.
- prioridades administrativas, versiones congeladas y líneas desactivadas;
- indicadores y visualizaciones pertinentes para dashboards de decisión.

Método de análisis obligatorio:
1. Comprende el alcance solicitado: fábrica, período, línea, producto/SKU o visión global.
2. Verifica la calidad de min/max, kg por bulto, demanda, capacidad, planning y reales informados.
3. Compara stock actual/proyectado, faltante hasta zona verde, cobertura, carga, capacidad libre y cumplimiento real/plan.
4. Separa claramente diagnóstico, causa observable, impacto y recomendación.
5. Si piden un dashboard, propone métricas y gráficos concretos usando solo los datos disponibles y explica qué decisión permite tomar cada uno.
6. Si existen varias interpretaciones razonables, indica la hipótesis elegida.

Reglas obligatorias:
1. No inventes cifras, productos, líneas, recetas, causas ni acciones ejecutadas.
2. Distingue claramente: dato observado, cálculo del sistema y recomendación.
3. Si falta un dato, dilo y explica cuál falta.
4. Para cada alerta importante, identifica producto o línea y cuantifica el problema.
5. Empieza con una conclusión breve y luego aporta cifras y acciones ordenadas.
6. Si preguntan qué hacer, propone acciones ordenadas por impacto y urgencia.
7. Nunca afirmes que modificaste el planning. Solo la aplicación ejecuta acciones explícitas.
8. Las recetas no forman parte del contexto y no debes intentar reconstruirlas.
9. Cuando compares real vs plan, aclara si faltan turnos reales informados.
10. Si la pregunta no puede responderse con el contexto, dilo honestamente e identifica exactamente el dato faltante.
11. No confundas baja carga planificada con capacidad insuficiente: compara por separado demanda/capacidad y plan/capacidad.
12. No llames producción real a un turno sin real informado. Indica el porcentaje de datos reales faltantes.
`;

function extraerTexto(respuesta) {
  if (typeof respuesta.output_text === "string" && respuesta.output_text.trim()) return respuesta.output_text.trim();
  return (respuesta.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text || "")
    .join("\n")
    .trim();
}

async function usuarioAutorizado(req) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return true;
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return false;
  const respuesta = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { authorization, apikey: anonKey },
  });
  return respuesta.ok;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    if (!(await usuarioAutorizado(req))) {
      res.status(401).json({ error: "Sesion no autorizada" });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "IAldo no está configurado", code: "IALDO_NOT_CONFIGURED" });
      return;
    }

    const question = String(req.body?.question || "").trim().slice(0, 4000);
    const contexte = req.body?.contexte;
    const historique = Array.isArray(req.body?.historique) ? req.body.historique.slice(-8) : [];
    if (!question || !contexte) {
      res.status(400).json({ error: "Pregunta o contexto faltante" });
      return;
    }

    const contexteJson = JSON.stringify(contexte);
    if (contexteJson.length > 650000) {
      res.status(413).json({ error: "El contexto de IAldo es demasiado grande" });
      return;
    }

    const input = [
      ...historique.map((mensaje) => ({
        role: mensaje.role === "aldo" ? "assistant" : "user",
        content: String(mensaje.texte || "").slice(0, 3000),
      })),
      {
        role: "user",
        content: `PREGUNTA:\n${question}\n\nCONTEXTO CALCULADO POR CHOCO PLANNER:\n${contexteJson}`,
      },
    ];

    const respuesta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.ALDO_OPENAI_MODEL || "gpt-5-mini",
        instructions: SYSTEM_PROMPT,
        input,
        reasoning: { effort: "medium" },
        max_output_tokens: 2400,
      }),
    });

    const data = await respuesta.json();
    if (!respuesta.ok) {
      res.status(502).json({ error: data?.error?.message || "No se pudo consultar IAldo" });
      return;
    }

    const texte = extraerTexto(data);
    if (!texte) {
      res.status(502).json({ error: "IAldo no devolvió una respuesta" });
      return;
    }
    res.status(200).json({ texte, model: data.model || process.env.ALDO_OPENAI_MODEL || "gpt-5-mini" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error interno de IAldo" });
  }
}
