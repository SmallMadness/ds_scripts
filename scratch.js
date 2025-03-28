// ==UserScript==
// @name         Tribal Wars Schnellleisten PopUp Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Ein Button in der Schnellleiste von Tribal Wars, der ein PopUp anzeigt
// @author       Du
// @match        https://*.tribalwars.de/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Funktion für das PopUp
    function showPopup() {
        window.alert("Hallo!");
    }

    // Stelle sicher, dass der Button nach dem Laden der Seite hinzugefügt wird
    window.addEventListener('load', function() {
        // Überprüfe, ob der Schnellleisten-Bereich existiert
        var toolbar = document.getElementById('quickbar');
        if (toolbar) {
            // Erstelle einen neuen Button
            var button = document.createElement('button');
            button.innerHTML = "PopUp";
            button.style.margin = "5px";
            button.style.padding = "5px 10px";
            button.style.cursor = "pointer";
            button.style.backgroundColor = "#4CAF50";
            button.style.color = "white";
            button.style.border = "none";
            button.style.borderRadius = "5px";
            button.style.fontSize = "14px";
            button.style.fontWeight = "bold";

            // Füge dem Button die Funktion zum Anzeigen des PopUps hinzu
            button.addEventListener('click', showPopup);

            // Füge den Button zur Schnellleiste hinzu
            toolbar.appendChild(button);
        }
    });
})();
