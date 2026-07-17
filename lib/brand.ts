export const brandColors = [
  { name: "Tinta", role: "Fondo y texto. La base de todo.", hex: "#050505", variable: "--ink", text: "#eae9e2" },
  { name: "Papel", role: "Superficie del producto. Cálido, nunca blanco puro.", hex: "#eae9e2", variable: "--paper", text: "#191b1a" },
  { name: "Ácido", role: "Se gana: pagos confirmados, acciones principales.", hex: "#d7f85b", variable: "--acid", text: "#191b1a" },
  { name: "Violeta", role: "Seguimiento y procesos en curso.", hex: "#9f8bff", variable: "--violet", text: "#191b1a" },
  { name: "Naranja", role: "Vencimientos que se acercan. Atención, no alarma.", hex: "#ffb77e", variable: "--ember", text: "#191b1a" },
] as const;

export function logoSvg(circle: string, dot: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="32" fill="${circle}"/><circle cx="32" cy="32" r="9" fill="${dot}"/></svg>`;
}

export const logoVariants = [
  { name: "Ácido sobre tinta", file: "oasis-acido", circle: "#d7f85b", dot: "#050505", surface: "#050505" },
  { name: "Tinta sobre papel", file: "oasis-tinta", circle: "#050505", dot: "#d7f85b", surface: "#eae9e2" },
  { name: "Papel sobre tinta", file: "oasis-papel", circle: "#eae9e2", dot: "#050505", surface: "#050505" },
] as const;

export function downloadSvg(svg: string, filename: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}
