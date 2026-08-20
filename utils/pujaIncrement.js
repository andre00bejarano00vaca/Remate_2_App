export const calcularIncremento = (valor, sw = false) => {
  const n = Number(valor) || 0;
  if (n < 500) return sw ? 30 : 20;
  if (n < 1000) return 50;
  if (n < 2000) return 100;
  return 500;
};

export const resolverSwParaSiguientePuja = (valorActual, baseInicial = 0) => {
  let current = Number(baseInicial) || 0;
  let sw = true;
  const target = Number(valorActual) || 0;

  if (target <= current) return sw;

  while (current < target) {
    const inc = calcularIncremento(current, sw);
    const next = current + inc;
    if (next > target) return sw;
    current = next;
    sw = !sw;
  }

  return sw;
};

export const calcularSiguientePuja = (valorActual = 0, sw = false) => {
  const valor = Number(valorActual) || 0;
  return valor + calcularIncremento(valor, sw);
};

export const calcularPujaDesdeBase = (valorActual = 0, baseInicial = 0) => {
  const valor = Number(valorActual) || 0;
  const sw = resolverSwParaSiguientePuja(valor, baseInicial);
  return {
    sw,
    incremento: calcularIncremento(valor, sw),
    siguientePuja: calcularSiguientePuja(valor, sw),
  };
};
