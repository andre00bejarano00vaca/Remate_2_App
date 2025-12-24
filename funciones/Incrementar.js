class SiguientePujaObjeto {
    constructor(){}

      Incrementar ( valorActual, sw){
        if (valorActual < 300) {
            return sw ? 20 : 30;
        } else if (valorActual < 1000) {
            return 50;
        } else if (valorActual < 2000) {
            return 100;
        } else {
            return 500;
        }
    }
    
      SiguientePuja(){
        
    }
}