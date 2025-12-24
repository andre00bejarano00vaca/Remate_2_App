export const usePuja = (valorActual = 0, sw = false) => {

  const calcularIncremento = (valor) => {
    if (valor < 300) return sw ? 20 : 30;
    if (valor < 1000) return 50;
    if (valor < 2000) return 100;
    return 500;
  };

  const siguientePuja = valorActual + calcularIncremento(valorActual);

  return { siguientePuja };
};
