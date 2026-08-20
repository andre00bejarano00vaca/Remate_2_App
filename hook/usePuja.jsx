import { calcularPujaDesdeBase } from "../utils/pujaIncrement";

export const usePuja = (valorActual = 0, baseInicial = 0) => {
  return calcularPujaDesdeBase(valorActual, baseInicial);
};
