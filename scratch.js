javascript:(function(){
    let speer = document.querySelector("input[name='spear']");
    let schwert = document.querySelector("input[name='sword']");

    if (speer && schwert) {
        speer.value = 100;  // 100 Speerkämpfer setzen
        schwert.value = 50;  // 50 Schwertkämpfer setzen
        alert("Truppen wurden gesetzt!");
    } else {
        alert("Fehler: Truppen-Inputs nicht gefunden!");
    }
})();
