import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak, LevelFormat } from 'docx';

const C = {
  dark: "1A1A2E", muted: "6B7280", line: "E5E7EB", bg: "F9FAFB", white: "FFFFFF",
  green: "065F46", greenBg: "ECFDF5",
  red: "991B1B", redBg: "FEF2F2",
  amber: "78350F", amberBg: "FFFBEB",
  blue: "1E3A8A", blueBg: "EFF6FF", blueBorder: "BFDBFE",
  grey: "374151", greyBg: "F3F4F6",
};

const BORDER = { style: BorderStyle.SINGLE, size: 1, color: C.line };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function sp(before = 60, after = 60) { return { spacing: { before, after } }; }
function run(text, opts = {}) { return new TextRun({ text, font: "Arial", size: 20, color: C.grey, ...opts }); }
function spacer(h = 80) { return new Paragraph({ children: [run("")], spacing: { before: h, after: h } }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function inputTable(fields) {
  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: [2600, 6600],
    rows: fields.map(f => new TableRow({
      children: [
        new TableCell({
          borders: BORDERS, shading: { fill: C.greyBg, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 100 },
          width: { size: 2600, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({ children: [run(f.label, { size: 18, bold: true, color: C.muted })], ...sp(0, 0) })]
        }),
        new TableCell({
          borders: BORDERS, shading: { fill: f.value ? C.white : C.white, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 100 },
          width: { size: 6600, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({
            children: [run(f.value || f.placeholder || "", {
              size: 18,
              italics: !f.value,
              color: f.value ? C.grey : "C4C9D4"
            })],
            ...sp(0, 0)
          })]
        }),
      ]
    })),
  });
}

function sectionTitle(text, color = C.dark) {
  return new Paragraph({
    children: [run(text, { size: 24, bold: true, color })],
    ...sp(220, 100),
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 4 } }
  });
}

function checkItem(text) {
  return new Paragraph({
    children: [run("☐  " + text, { size: 18, color: C.grey })],
    ...sp(28, 28),
    indent: { left: 200 },
  });
}

function problemBlock(num) {
  return [
    new Paragraph({
      children: [run(`✗  Problém #${num}`, { size: 21, bold: true, color: C.red })],
      ...sp(160, 80),
    }),
    inputTable([
      { label: "Zjištění", placeholder: "Popiš co konkrétně nefunguje..." },
      { label: "Screenshot / graf", placeholder: "Vlož screenshot nebo odkaz..." },
      { label: "Benchmark trhu", placeholder: "Jak to dělá trh / konkurence..." },
      { label: "Náročnost + hod.", placeholder: "nízká / střední / vysoká  +  odhadovaný počet hodin" },
      { label: "Typ aktivity", placeholder: "jednorázová  /  opakovaná měsíčně" },
      { label: "Závislost na kanálu", placeholder: "ano / ne  —  pokud ano, na jakém?" },
    ]),
    spacer(60),
  ];
}

function priorityBlock() {
  return [
    new Paragraph({
      children: [run("⚡  Priorita #1  —  bez jejího vyřešení nemá smysl nic dalšího", { size: 21, bold: true, color: C.amber })],
      ...sp(200, 60),
    }),
    new Paragraph({
      children: [run("Vyber jednu prioritu z výše popsaných problémů a doplň závislosti.", { size: 17, italics: true, color: C.muted })],
      ...sp(40, 100),
    }),
    inputTable([
      { label: "Zjištění", placeholder: "Která konkrétní věc je priorita #1?" },
      { label: "Proč je to priorita", placeholder: "1–2 věty — proč bez toho nemá smysl nic dalšího..." },
      { label: "Náročnost + hod.", placeholder: "nízká / střední / vysoká  +  odhadovaný počet hodin" },
      { label: "Typ aktivity", placeholder: "jednorázová  /  opakovaná měsíčně" },
      { label: "Závislost na jiném kanálu", placeholder: "ano / ne  —  pokud ano, na čem konkrétně?" },
      { label: "Závislost na vstupu od klienta", placeholder: "ano / ne  —  co konkrétně potřebujeme?" },
      { label: "Závislost na jiném předpokladu", placeholder: "ano / ne  —  co musí nastat dřív?" },
    ]),
  ];
}

const KANALY_DATA = {
  "Analytika (GA4)": {
    note: "Audituj jako první — pokud měření nefunguje, závěry z ostatních kanálů jsou nespolehlivé.",
    oblasti: [
      { nazev: "Měření konverzí", items: ["Jsou nastaveny konverzní události (nákup, formulář, registrace...)?", "Počítají se správně — nejsou zdvojené?", "Odpovídají události byznysovým cílům klienta?"] },
      { nazev: "Propojení nástrojů", items: ["Je GA4 propojeno s Google Ads?", "Je propojeno s Google Search Console?", "Je propojen Meta Pixel?"] },
      { nazev: "Struktura dat", items: ["Je nastaven správný stream pro web?", "Jsou filtrovány interní návštěvy?", "Jsou nastaveny UTM parametry v kampaních?"] },
      { nazev: "Přístupnost reportů", items: ["Má klient přístup ke GA4?", "Existují přehledné reporty / dashboardy?"] },
    ]
  },
  "Performance (Google Ads, Meta Ads)": {
    note: null,
    oblasti: [
      { nazev: "Struktura účtu", items: ["Je struktura kampaní logická (kampaně → sestavy → inzeráty)?", "Odpovídá cílení záměru klienta?", "Jsou odděleny brand a non-brand kampaně?"] },
      { nazev: "Konverzní akce", items: ["Jsou konverzní akce správně nastaveny a propojeny s GA4?", "Optimalizují se kampaně na správný cíl?"] },
      { nazev: "Budget a výkon", items: ["Odpovídá alokace budgetu výkonu sestav?", "Jsou viditelné trendy výkonu (ROAS, CPA)?", "Jsou vypnuty dlouhodobě nefunkční sestavy?"] },
      { nazev: "Kreativy a copy", items: ["Jsou kreativy aktuální a relevantní?", "Probíhá nebo probíhalo A/B testování?"] },
    ]
  },
  "SEO a organika": {
    note: null,
    oblasti: [
      { nazev: "Technický základ", items: ["Je web správně indexován (Search Console)?", "Jaká je rychlost načítání (PageSpeed Insights)?", "Je web optimalizován pro mobilní zařízení?"] },
      { nazev: "On-page optimalizace", items: ["Mají stránky správnou strukturu H1–H6?", "Jsou vyplněny title a meta description?", "Funguje interní prolinkování?"] },
      { nazev: "Obsah a autorita", items: ["Existuje konzistentní obsahová strategie?", "Jaká je autorita domény (Ahrefs / Semrush)?", "Existují zpětné odkazy? Jsou kvalitní?"] },
    ]
  },
  "Web / CMS": {
    note: null,
    oblasti: [
      { nazev: "Technický stav", items: ["Jaká je rychlost načítání (PageSpeed pod 50 = kritický problém)?", "Existují technické chyby (404, broken links)?", "Je web zabezpečen (HTTPS)?"] },
      { nazev: "UX a konverze", items: ["Jsou jasně viditelné CTA prvky?", "Fungují formuláře a kontaktní prvky?", "Je navigace intuitivní?"] },
      { nazev: "Brand a obsah", items: ["Odpovídá web vizuální identitě značky?", "Je obsah aktuální a bez chyb?"] },
    ]
  },
  "UX": {
    note: null,
    oblasti: [
      { nazev: "Uživatelské toky", items: ["Jak se návštěvník dostane k hlavnímu cíli (GA4 funnel)?", "Kde uživatelé nejčastěji odpadávají?"] },
      { nazev: "Konverzní stránky", items: ["Je landing page přehledná a má jasný CTA?", "Jsou produktové stránky / formuláře funkční?"] },
      { nazev: "Mobilní zkušenost a bariéry", items: ["Je web plně responzivní?", "Existují technické nebo obsahové bariéry před konverzí?"] },
    ]
  },
  "Social media (organické)": {
    note: null,
    oblasti: [
      { nazev: "Konzistence a kvalita", items: ["Jak pravidelně se publikuje?", "Je vizuální identita konzistentní?", "Jsou využívány různé formáty (video, reels, stories)?"] },
      { nazev: "Engagement a cíle", items: ["Jaká je míra zapojení komunity?", "Táhne obsah k byznysovým cílům?", "Existují CTA v příspěvcích?"] },
    ]
  },
  "E-mailing": {
    note: null,
    oblasti: [
      { nazev: "Technické nastavení", items: ["Je nastaveno SPF a DKIM (doručitelnost)?", "Jaká je míra doručení (mail tester)?"] },
      { nazev: "Databáze a automatizace", items: ["Jak velká je databáze kontaktů?", "Je databáze segmentována?", "Existuje welcome sekvence?", "Jsou nastaveny základní flows (opuštěný košík, reaktivace)?"] },
      { nazev: "Výkonnost", items: ["Jaký je open rate (benchmark oboru: ~20–30%)?", "Jaký je click rate (benchmark oboru: ~2–5%)?"] },
    ]
  },
  "Obsahová strategie": {
    note: null,
    oblasti: [
      { nazev: "Obsahový plán", items: ["Existuje obsahový plán / editorial kalendář?", "Je obsah tvořen pravidelně?"] },
      { nazev: "Zákaznická cesta", items: ["Je pokryta fáze awareness?", "Je pokryta fáze consideration?", "Je pokryta fáze conversion?"] },
      { nazev: "Distribuce", items: ["Jak se obsah šíří napříč kanály?", "Je obsah repurposován pro různé formáty?"] },
    ]
  },
  "Brand a kreativa": {
    note: null,
    oblasti: [
      { nazev: "Vizuální konzistence", items: ["Je vizuální identita jednotná napříč všemi kanály?", "Existuje brand manuál?"] },
      { nazev: "Kreativní podklady a komunikace", items: ["Jsou dostupné kvalitní fotografie a videa?", "Existují grafické šablony pro obsah?", "Odpovídá tón komunikace pozicioningu značky?"] },
    ]
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { kontext, kanaly } = req.body;

  const children = [];

  // ── TITULNÍ STRANA ──
  children.push(
    new Paragraph({ children: [run("MVP Audit", { size: 40, bold: true, color: C.dark })], spacing: { before: 0, after: 80 } }),
    new Paragraph({ children: [run("Interní nástroj — výstup slouží jako vstup pro roadmapu a nacenění. Klient audit nevidí.", { size: 18, italics: true, color: C.muted })], spacing: { before: 0, after: 160 } }),
    inputTable([
      { label: "Datum auditu", placeholder: "" },
      { label: "Varianta spolupráce", placeholder: "A  /  B" },
    ]),
    spacer(200),
  );

  // ── KONTEXT KLIENTA ──
  children.push(
    new Paragraph({ children: [run("Kontext klienta", { size: 28, bold: true, color: C.dark })], spacing: { before: 0, after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.dark, space: 4 } } }),
    new Paragraph({ children: [run("Přečti si před zahájením auditu. Vyplněno salesem na základě discovery schůzky.", { size: 17, italics: true, color: C.muted })], spacing: { before: 60, after: 140 } }),
  );

  children.push(
    new Paragraph({ children: [run("Základní informace", { size: 18, bold: true, color: C.dark, allCaps: true })], ...sp(0, 80) }),
    inputTable([
      { label: "Název klienta", value: kontext.nazev },
      { label: "Obor / produkt", value: kontext.obor },
      { label: "Priorita pro nás", value: kontext.kategorie },
      { label: "Varianta", value: kontext.varianta },
    ]),
    spacer(120),
    new Paragraph({ children: [run("Co klienta bolí", { size: 18, bold: true, color: C.red, allCaps: true })], ...sp(0, 80) }),
    inputTable([
      { label: "Hlavní problém", value: kontext.problem },
      { label: "Spouštěč", value: kontext.spoustec },
      { label: "Červené vlajky", value: kontext.vlajky },
    ]),
    spacer(120),
    new Paragraph({ children: [run("Cíl a metriky", { size: 18, bold: true, color: C.green, allCaps: true })], ...sp(0, 80) }),
    inputTable([
      { label: "Cíl za 12 měsíců", value: kontext.cil },
      { label: "Klíčové metriky", value: kontext.metriky },
    ]),
    spacer(120),
    new Paragraph({ children: [run("Kanály v tomto auditu", { size: 18, bold: true, color: C.dark, allCaps: true })], ...sp(0, 80) }),
    inputTable([
      { label: "Auditované kanály", value: kanaly.join(", ") },
    ]),
    spacer(120),
    new Paragraph({ children: [run("Předchozí zkušenost a dynamika", { size: 18, bold: true, color: C.amber, allCaps: true })], ...sp(0, 80) }),
    inputTable([
      { label: "Předchozí agentura", value: kontext.agentura },
      { label: "Kdo rozhoduje", value: kontext.rozhodovatel },
    ]),
  );

  // ── KANÁLY ──
  for (const kanalNazev of kanaly) {
    const data = KANALY_DATA[kanalNazev];
    if (!data) continue;

    children.push(pageBreak());

    children.push(
      new Paragraph({ children: [run(kanalNazev, { size: 30, bold: true, color: C.dark })], spacing: { before: 0, after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.dark, space: 4 } } }),
      new Paragraph({
        children: [
          run("Specialist: ", { size: 18, bold: true, color: C.muted }),
          run("_______________________     ", { size: 18, color: C.muted }),
          run("Datum: ", { size: 18, bold: true, color: C.muted }),
          run("_______________", { size: 18, color: C.muted }),
        ],
        spacing: { before: 80, after: 120 },
      }),
    );

    if (data.note) {
      children.push(
        new Table({
          width: { size: 9200, type: WidthType.DXA },
          columnWidths: [9200],
          rows: [new TableRow({ children: [new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 1, color: C.blueBorder }, bottom: { style: BorderStyle.SINGLE, size: 1, color: C.blueBorder }, left: { style: BorderStyle.SINGLE, size: 16, color: C.blue }, right: { style: BorderStyle.SINGLE, size: 1, color: C.blueBorder } },
            shading: { fill: C.blueBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 200, right: 200 },
            width: { size: 9200, type: WidthType.DXA },
            children: [new Paragraph({ children: [run(`ℹ  ${data.note}`, { size: 18, bold: true, color: C.blue })], ...sp(0, 0) })]
          })] })]
        }),
        spacer(100),
      );
    }

    // Checklist
    children.push(new Paragraph({ children: [run("Oblasti ke kontrole", { size: 18, bold: true, color: C.dark, allCaps: true })], ...sp(60, 40) }));
    for (const oblast of data.oblasti) {
      children.push(new Paragraph({ children: [run(oblast.nazev, { size: 18, bold: true, color: C.grey })], ...sp(60, 20) }));
      for (const item of oblast.items) {
        children.push(checkItem(item));
      }
    }

    children.push(spacer(120));

    // Co funguje
    children.push(
      new Paragraph({ children: [run("✓  Co funguje", { size: 21, bold: true, color: C.green })], ...sp(80, 80) }),
      inputTable([
        { label: "Zjištění", placeholder: "1 věc, která funguje..." },
        { label: "Screenshot / graf", placeholder: "Vlož screenshot nebo odkaz..." },
        { label: "Benchmark trhu", placeholder: "Jak to dělá trh / best practice..." },
      ]),
      spacer(100),
    );

    // Problémy
    for (let i = 1; i <= 3; i++) children.push(...problemBlock(i));

    // Priorita
    children.push(...priorityBlock());
  }

  // ── MANAŽERSKÉ SHRNUTÍ ──
  children.push(pageBreak());
  children.push(
    new Paragraph({ children: [run("Manažerské shrnutí", { size: 30, bold: true, color: C.dark })], spacing: { before: 0, after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.dark, space: 4 } } }),
    new Paragraph({ children: [run("Vyplňuje sales po dokončení auditu specialisty. Slouží jako vstup pro sestavení roadmapy a nacenění.", { size: 17, italics: true, color: C.muted })], spacing: { before: 60, after: 160 } }),
    sectionTitle("1. Souhrn priorit #1 ze všech kanálů", C.red),
    new Paragraph({ children: [run("Pro každý auditovaný kanál přepiš Prioritu #1:", { size: 17, italics: true, color: C.muted })], ...sp(40, 80) }),
    new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [2200, 4200, 1600, 1200],
      rows: [
        new TableRow({ children: ["Kanál", "Priorita #1", "Náročnost", "Závisí na..."].map((t, i) => new TableCell({ borders: BORDERS, shading: { fill: C.dark, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: [2200,4200,1600,1200][i], type: WidthType.DXA }, children: [new Paragraph({ children: [run(t, { size: 17, bold: true, color: "FFFFFF" })], ...sp(0,0) })] })) }),
        ...kanaly.map((k, i) => new TableRow({
          height: { value: 550, rule: "atLeast" },
          children: [k, "", "", ""].map((text, j) => new TableCell({ borders: BORDERS, shading: { fill: i % 2 === 0 ? C.bg : C.white, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, width: { size: [2200,4200,1600,1200][j], type: WidthType.DXA }, children: [new Paragraph({ children: [run(text, { size: 17, bold: j === 0, color: j === 0 ? C.dark : C.grey })], ...sp(0,0) })] }))
        }))
      ]
    }),
    spacer(140),
    sectionTitle("2. Závislosti mezi kanály", C.amber),
    ...["", "", ""].map(() => new Paragraph({ children: [run("")], spacing: { before: 20, after: 20 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.line } } })),
    spacer(120),
    sectionTitle("3. Navrhovaná Fáze 1 roadmapy", C.green),
    new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [3800, 2200, 1800, 1400],
      rows: [
        new TableRow({ children: ["Aktivita", "Kanál", "Typ", "Hod./měs."].map((t, i) => new TableCell({ borders: BORDERS, shading: { fill: C.green, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: [3800,2200,1800,1400][i], type: WidthType.DXA }, children: [new Paragraph({ children: [run(t, { size: 17, bold: true, color: "FFFFFF" })], ...sp(0,0) })] })) }),
        ...[1,2,3,4,5].map((n, i) => new TableRow({ height: { value: 500, rule: "atLeast" }, children: ["","","jednorázová / opakovaná",""].map((t, j) => new TableCell({ borders: BORDERS, shading: { fill: i % 2 === 0 ? C.greenBg : C.white, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, width: { size: [3800,2200,1800,1400][j], type: WidthType.DXA }, children: [new Paragraph({ children: [run(t, { size: 17, italics: j === 2, color: j === 2 ? "C4C9D4" : C.grey })], ...sp(0,0) })] })) }))
      ]
    }),
    spacer(120),
    sectionTitle("4. Odhad celkové náročnosti", C.dark),
    new Table({
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [3600, 2800, 2800],
      rows: [
        new TableRow({ children: ["", "Měsíc 1 (jednorázové + paušál)", "Od měsíce 2 (paušál)"].map((t, i) => new TableCell({ borders: BORDERS, shading: { fill: C.dark, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: [3600,2800,2800][i], type: WidthType.DXA }, children: [new Paragraph({ children: [run(t, { size: 17, bold: true, color: "FFFFFF" })], ...sp(0,0) })] })) }),
        ...["Jednorázové hodiny celkem", "Opakované hodiny / měs.", "Celkový odhad"].map((label, i) => new TableRow({ height: { value: 500, rule: "atLeast" }, children: [label,"",""].map((t, j) => new TableCell({ borders: BORDERS, shading: { fill: i === 2 ? C.amberBg : (i % 2 === 0 ? C.bg : C.white), type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, width: { size: [3600,2800,2800][j], type: WidthType.DXA }, children: [new Paragraph({ children: [run(t, { size: 18, bold: i === 2 && j === 0, color: i === 2 ? C.amber : C.grey })], ...sp(0,0) })] })) }))
      ]
    }),
    spacer(120),
    sectionTitle("5. Doporučení sales", C.dark),
    inputTable([
      { label: "Doporučená varianta", placeholder: "A  /  B  — a proč..." },
      { label: "Klíčové zdůvodnění", placeholder: "2–3 věty proč tato varianta odpovídá situaci klienta..." },
      { label: "Hlavní riziko", placeholder: "Co může blokovat spolupráci nebo co ještě nevíme..." },
      { label: "Next step", placeholder: "Co udělat jako první po schválení roadmapy klientem..." },
    ]),
  );

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20, color: C.grey } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial", color: C.dark }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial", color: C.dark }, paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
      ]
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } },
      children,
    }]
  });

  const buffer = await Packer.toBuffer(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="audit-${Date.now()}.docx"`);
  res.send(buffer);
}
