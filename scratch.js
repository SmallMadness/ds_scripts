// Globale Variablen
var sourceID = 0;
var sourceWood = 0;
var sourceStone = 0;
var sourceIron = 0;
var sourceMerchants = 0;
var warehouseCapacity = [];
var allWoodTotals = [];
var allClayTotals = [];
var allIronTotals = [];
var availableMerchants = [];
var totalMerchants = [];
var farmSpaceUsed = [];
var farmSpaceTotal = [];
var villagesData = [];
var allWoodObjects, allClayObjects, allIronObjects, allVillages;
var totalsAndAverages = "";
var data, totalWood = 0, totalStone = 0, totalIron = 0, resLimit = 0;
var sendBack;
var totalWoodSent = 0, totalStoneSent = 0, totalIronSent = 0;
var coordinate = "";

if (typeof woodPercentage == 'undefined') {
    woodPercentage = 28000 / 83000;
    stonePercentage = 30000 / 83000;
    ironPercentage = 25000 / 83000;
}

// Spracheinstellungen
var langShinko = [
    "Resource sender for flag boost minting",
    "Enter coordinate to send to",
    "Save",
    "Creator",
    "Player",
    "Village",
    "Points",
    "Coordinate to send to",
    "Keep WH% behind",
    "Recalculate res/change",
    "Res sender",
    "Source village",
    "Target village",
    "Distance",
    "Wood",
    "Clay",
    "Iron",
    "Send resources",
    "Created by Sophie 'Shinko to Kuma'"
];

// CSS Styles
var cssClassesSophie = `
<style>
.sophRowA {
    background-color: #32353b;
    color: white;
}
.sophRowB {
    background-color: #36393f;
    color: white;
}
.sophHeader {
    background-color: #202225;
    font-weight: bold;
    color: white;
}
</style>`;

// CSS einfügen
$("#contentContainer").eq(0).prepend(cssClassesSophie);
$("#mobileHeader").eq(0).prepend(cssClassesSophie);

// Ressourcenlimit prüfen
if ("resLimit" in sessionStorage) {
    resLimit = parseInt(sessionStorage.getItem("resLimit"));
} else {
    sessionStorage.setItem("resLimit", resLimit);
}

// Dorfdaten sammeln
function collectVillageData() {
    var URLReq = game_data.player.sitter > 0
        ? `game.php?t=${game_data.player.id}&screen=overview_villages&mode=prod&page=-1&`
        : "game.php?&screen=overview_villages&mode=prod&page=-1&";

    $.get(URLReq, function(page) {
        // Mobile/Desktop Unterscheidung
        var isMobile = $("#mobileHeader")[0];

        if (isMobile) {
            allWoodObjects = $(page).find(".res.mwood,.warn_90.mwood,.warn.mwood");
            allClayObjects = $(page).find(".res.mstone,.warn_90.mstone,.warn.mstone");
            allIronObjects = $(page).find(".res.miron,.warn_90.miron,.warn.miron");
            allWarehouses = $(page).find(".mheader.ressources");
            allVillages = $(page).find(".quickedit-vn");
            allFarms = $(page).find(".header.population");
            allMerchants = $(page).find('a[href*="market"]');
        } else {
            allWoodObjects = $(page).find(".res.wood,.warn_90.wood,.warn.wood");
            allClayObjects = $(page).find(".res.stone,.warn_90.stone,.warn.stone");
            allIronObjects = $(page).find(".res.iron,.warn_90.iron,.warn.iron");
            allVillages = $(page).find(".quickedit-vn");
        }

        // Ressourcen sammeln
        for (var i = 0; i < allWoodObjects.length; i++) {
            allWoodTotals.push(allWoodObjects[i].textContent.replace(/\./g, '').replace(',', ''));
            allClayTotals.push(allClayObjects[i].textContent.replace(/\./g, '').replace(',', ''));
            allIronTotals.push(allIronObjects[i].textContent.replace(/\./g, '').replace(',', ''));

            if (isMobile) {
                warehouseCapacity.push(allWarehouses[i].parentElement.innerText);
                farmSpaceUsed.push(allFarms[i].parentElement.innerText.match(/(\d*)\/(\d*)/)[1]);
                farmSpaceTotal.push(allFarms[i].parentElement.innerText.match(/(\d*)\/(\d*)/)[2]);
            } else {
                warehouseCapacity.push(allIronObjects[i].parentElement.nextElementSibling.innerHTML);
                availableMerchants.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[1]);
                totalMerchants.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[2]);
                farmSpaceUsed.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[1]);
                farmSpaceTotal.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[2]);
            }
        }

        // Dorfdaten strukturieren
        for (var i = 0; i < allVillages.length; i++) {
            villagesData.push({
                "id": allVillages[i].dataset.id,
                "url": allVillages[i].children[0].children[0].href,
                "coord": allVillages[i].innerText.trim().match(/\d+\|\d+/)[0],
                "name": allVillages[i].innerText.trim(),
                "wood": allWoodTotals[i],
                "stone": allClayTotals[i],
                "iron": allIronTotals[i],
                "availableMerchants": availableMerchants[i],
                "totalMerchants": totalMerchants[i],
                "warehouseCapacity": warehouseCapacity[i],
                "farmSpaceUsed": farmSpaceUsed[i],
                "farmSpaceTotal": farmSpaceTotal[i]
            });
        }

        // Starte den Auswahlprozess
        askCoordinate();
    });
}

// Starte das Skript
collectVillageData();

// Hauptfunktionen
function askCoordinate() {
    showSourceSelect(false); // Starte mit Zieldorf-Auswahl
}

function selectTargetVillage(coordinate) {
    Dialog.close();
    sessionStorage.setItem("coordinate", coordinate);
    coordToId(coordinate);
    showSourceSelect(true); // Nach Zieldorf Quell-Dorf auswählen
}

function storeSourceID(id, name, wood, stone, iron, merchants) {
    sourceID = id;
    sourceWood = wood;
    sourceStone = stone;
    sourceIron = iron;
    sourceMerchants = merchants;
    UI.SuccessMessage(`Verwende ${name} als Quell-Dorf.`);
    Dialog.close();
    createList();
}

function showSourceSelect(isSourceSelection) {
    var title = isSourceSelection ? "Quell-Dorf auswählen" : "Zieldorf auswählen";
    var promptText = isSourceSelection
        ? "Wählen Sie das Dorf aus, von dem Ressourcen gesendet werden sollen:"
        : "Wählen Sie das Ziel-Dorf aus, an das Ressourcen gesendet werden sollen:";

    var htmlSelection = `<div style='width:700px;'>
        <h1>${title}</h1>
        <br>
        <p>${promptText}</p>
        <span>Script made by Sophie "Shinko to Kuma"</span>
        <br>
        <table class="vis" style='width:700px;'>
            <tr>
                <th>Dorfname</th>
                <th>Ressourcen</th>
                <th>Entfernung</th>
                <th>Händler</th>
            </tr>`;

    // Dorfoptionen hinzufügen
    villagesData.forEach(function(village) {
        var clickHandler = isSourceSelection
            ? `storeSourceID('${village.id}', '${village.name}', ${village.wood}, ${village.stone}, ${village.iron}, '${village.availableMerchants}')`
            : `selectTargetVillage('${village.coord}')`;

        htmlSelection += `
            <tr class="trclass" style="cursor: pointer" onclick="${clickHandler}">
                <td>${village.name}</td>
                <td>
                    <span class="icon header wood"></span>${village.wood}
                    <span class="icon header stone"></span>${village.stone}
                    <span class="icon header iron"></span>${village.iron}
                </td>
                <td>${checkDistance(game_data.village.x, game_data.village.y, village.coord.split("|")[0], village.coord.split("|")[1])}</td>
                <td>${village.availableMerchants}/${village.totalMerchants}</td>
            </tr>`;
    });

    htmlSelection += "</table></div>";
    Dialog.show(title, htmlSelection);
}

// Hilfsfunktionen
function calculateResAmounts(wood, stone, iron, warehouse, merchants) {
    var merchantCarry = merchants * 1000;
    var leaveBehindRes = Math.floor(warehouse / 100 * resLimit);

    var localWood = Math.max(0, wood - leaveBehindRes);
    var localStone = Math.max(0, stone - leaveBehindRes);
    var localIron = Math.max(0, iron - leaveBehindRes);

    var merchantWood = (merchantCarry * woodPercentage);
    var merchantStone = (merchantCarry * stonePercentage);
    var merchantIron = (merchantCarry * ironPercentage);

    var perc = 1;
    if (merchantWood > localWood) perc = Math.min(perc, localWood / merchantWood);
    if (merchantStone > localStone) perc = Math.min(perc, localStone / merchantStone);
    if (merchantIron > localIron) perc = Math.min(perc, localIron / merchantIron);

    return {
        "wood": Math.floor(merchantWood * perc),
        "stone": Math.floor(merchantStone * perc),
        "iron": Math.floor(merchantIron * perc)
    };
}

function coordToId(coordinate) {
    var sitterID = game_data.player.sitter > 0
        ? `game.php?t=${game_data.player.id}&screen=api&ajax=target_selection&input=${coordinate}&type=coord`
        : `/game.php?&screen=api&ajax=target_selection&input=${coordinate}&type=coord`;

    $.get(sitterID, function(json) {
        data = parseFloat(game_data.majorVersion) > 8.217 ? json : JSON.parse(json);
        sendBack = [
            data.villages[0].id,
            data.villages[0].name,
            data.villages[0].image,
            data.villages[0].player_name,
            data.villages[0].points,
            data.villages[0].x,
            data.villages[0].y
        ];
    });
}

function createList() {
    if ($("#sendResources")[0]) {
        $("#sendResources").remove();
        $("#resourceSender").remove();
    }

    var htmlString = `
        <div id="resourceSender">
            <table id="playerTarget" width="600">
                <tbody>
                    <tr>
                        <td class="sophHeader" rowspan="3"><img src="${sendBack[2]}"></td>
                        <td class="sophHeader">${langShinko[4]}:</td>
                        <td class="sophRowA">${sendBack[3]}</td>
                        <td class="sophHeader"><span class="icon header wood"></span></td>
                        <td class="sophRowB" id="woodSent">${numberWithCommas(totalWoodSent)}</td>
                    </tr>
                    <tr>
                        <td class="sophHeader">${langShinko[5]}:</td>
                        <td class="sophRowB">${sendBack[1]}</td>
                        <td class="sophHeader"><span class="icon header stone"></span></td>
                        <td class="sophRowA" id="stoneSent">${numberWithCommas(totalStoneSent)}</td>
                    </tr>
                    <tr>
                        <td class="sophHeader">${langShinko[6]}:</td>
                        <td class="sophRowA">${sendBack[4]}</td>
                        <td class="sophHeader"><span class="icon header iron"></span></td>
                        <td class="sophRowB" id="ironSent">${numberWithCommas(totalIronSent)}</td>
                    </tr>
                </tbody>
            </table>
            <table id="Settings" width="600">
                <thead>
                    <tr>
                        <td class="sophHeader">${langShinko[8]}</td>
                        <td class="sophHeader"></td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sophRowA" align="right">
                            <input type="text" ID="resPercent" name="resPercent" size="3" value="${resLimit}">%
                        </td>
                        <td class="sophRowA">
                            <button type="button" ID="sendRes" class="btn" name="sendRes" onclick="reDo()">${langShinko[9]}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="sendResources" border=0>
            <table id="tableSend" width="100%">
                <tbody id="appendHere">
                    <tr>
                        <td class="sophHeader" colspan=7 style="text-align:center">${langShinko[10]}</td>
                    </tr>
                    <tr>
                        <td class="sophHeader" width="25%" style="text-align:center">${langShinko[11]}</td>
                        <td class="sophHeader" width="25%" style="text-align:center">${langShinko[12]}</td>
                        <td class="sophHeader" width="5%" style="text-align:center">${langShinko[13]}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${langShinko[14]}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${langShinko[15]}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${langShinko[16]}</td>
                        <td class="sophHeader" width="15%">
                            <font size="1">${langShinko[18]}</font>
                        </td>
                    </tr>`;

    // Dorfliste erstellen
    villagesData.forEach(function(village, i) {
        if (village.id != sendBack[0]) {
            var res = calculateResAmounts(village.wood, village.stone, village.iron, village.warehouseCapacity, village.availableMerchants);

            if (res.wood + res.stone + res.iron > 0) {
                var rowClass = i % 2 == 0 ? "sophRowB" : "sophRowA";
                var distance = checkDistance(sendBack[5], sendBack[6], village.coord.split("|")[0], village.coord.split("|")[1]);

                htmlString += `
                    <tr class="${rowClass}" height="40">
                        <td><a href="${village.url}" style="color:#40D0E0;">${village.name}</a></td>
                        <td><a href="" style="color:#40D0E0;">${sendBack[1]}</a></td>
                        <td>${distance}</td>
                        <td width="50" style="text-align:center">${res.wood}<span class="icon header wood"></span></td>
                        <td width="50" style="text-align:center">${res.stone}<span class="icon header stone"></span></td>
                        <td width="50" style="text-align:center">${res.iron}<span class="icon header iron"></span></td>
                        <td style="text-align:center">
                            <input type="button" class="btn evt-confirm-btn btn-confirm-yes" value="${langShinko[17]}"
                                   onclick="sendResource(${sendBack[0]},${res.wood},${res.stone},${res.iron},${i})">
                        </td>
                    </tr>`;
            }
        }
    });

    htmlString += `</tbody></table></div>`;

    $("#contentContainer").prepend(htmlString);
    $("#resPercent").change(function() {
        resLimit = $(this).val();
        sessionStorage.setItem("resLimit", resLimit);
    });

    // Fokus auf ersten Button setzen
    $(":button").filter(function() { return $(this).val() === langShinko[17]; }).first().focus();
}

function sendResource(targetID, woodAmount, stoneAmount, ironAmount, rowNr) {
    if (!sourceID) {
        UI.ErrorMessage("Bitte erst ein Quell-Dorf auswählen!");
        return;
    }

    $(':button[value="' + langShinko[17] + '"]').prop('disabled', true);

    setTimeout(function() {
        $("#tableSend tr").eq(rowNr + 2).remove();
        $(':button[value="' + langShinko[17] + '"]').prop('disabled', false);
        $(":button").filter(function() { return $(this).val() === langShinko[17]; }).first().focus();

        if($("#tableSend tr").length <= 2) {
            alert("Finished sending!");
            $(".btn-pp").remove();
            throw Error("Done.");
        }
    }, 200);

    var e = {
        "target_id": targetID,
        "wood": woodAmount,
        "stone": stoneAmount,
        "iron": ironAmount
    };

    TribalWars.post("market", {
        ajaxaction: "map_send",
        village: sourceID
    }, e, function(e) {
        Dialog.close();
        UI.SuccessMessage(e.message);

        totalWoodSent += woodAmount;
        totalStoneSent += stoneAmount;
        totalIronSent += ironAmount;

        sourceWood -= woodAmount;
        sourceStone -= stoneAmount;
        sourceIron -= ironAmount;

        $("#woodSent").text(numberWithCommas(totalWoodSent));
        $("#stoneSent").text(numberWithCommas(totalStoneSent));
        $("#ironSent").text(numberWithCommas(totalIronSent));
    }, false);
}

// Utility-Funktionen
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function checkDistance(x1, y1, x2, y2) {
    return Math.round(Math.hypot(x1 - x2, y1 - y2));
}

function reDo() {
    coordToId(sessionStorage.getItem("coordinate"));
}

function formatTable() {
    $("#tableSend tr:gt(1)").each(function(i) {
        $(this).toggleClass("sophRowA", i % 2 === 0).toggleClass("sophRowB", i % 2 !== 0);
    });
}

function sortTableTest(n) {
    var table = $("#tableSend")[0];
    var rows = Array.from(table.rows).slice(2);
    var dir = "asc";
    var switching = true;
    var switchcount = 0;

    while (switching) {
        switching = false;
        for (var i = 0; i < rows.length - 1; i++) {
            var x = rows[i].cells[n].textContent;
            var y = rows[i + 1].cells[n].textContent;
            var shouldSwitch = (dir === "asc") ? Number(x) > Number(y) : Number(x) < Number(y);

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount++;
                break;
            }
        }

        if (!switching && switchcount === 0 && dir === "asc") {
            dir = "desc";
            switching = true;
        }
    }
    formatTable();
}