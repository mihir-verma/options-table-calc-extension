// Function to perform the custom calculations
function performCalculations(table) {
    let rows = table.rows;
    let strikeColumn = -1;
    let callPriceColumn = -1;
    let putPriceColumn = -1;
    let deltaCallColumn = -1;
    let deltaPutColumn = -1;

    const underlyingPrice = parseFloat(document
        .querySelector('span.main-number')
        .innerText.replace('$', '')
        .trim());

    // Identify the columns
    let headerCells = rows[0].cells;
    for (let j = 0; j < headerCells.length; j++) {
        let headerText = headerCells[j].innerText.trim().toLowerCase();

        if (headerText === "strike" && strikeColumn === -1) {
            strikeColumn = j;
        } else if (headerText === "last" && callPriceColumn === -1) {
            callPriceColumn = j;
        } else if (headerText === "last" && putPriceColumn === -1) {
            putPriceColumn = j;
        }

        if (headerText === "delta" && deltaCallColumn === -1) {
            deltaCallColumn = j;
        } else if (headerText === "delta" && deltaPutColumn === -1) {
            deltaPutColumn = j;
        }
    }

    // Adding headers for the new columns
    let callBEHeader = rows[0].insertCell(strikeColumn);
    callBEHeader.innerText = "Call BE";
    let putBEHeader = rows[0].insertCell(strikeColumn+2);
    putBEHeader.innerText = "Put BE";
    let successPutHeader = rows[0].insertCell(deltaPutColumn+3);
    successPutHeader.innerText = "Success/Fail";
    let intrExtrCallHeader = rows[0].insertCell(callPriceColumn+1);
    intrExtrCallHeader.innerText = "Intrinsic/Ext";
    let intrExtrPutHeader = rows[0].insertCell(putPriceColumn+4);
    intrExtrPutHeader.innerText = "Intrinsic/Ext";

    // Proceed only if there are "Strike" columns        
    if (strikeColumn > 0) {
        for (let i = 1; i < rows.length; i++) { // Start from 1 to skip the header
            try {
                const strikePrice = parseFloat(rows[i].cells[strikeColumn].innerText) || 0;

                //
                const callPrice = parseFloat(rows[i].cells[callPriceColumn].innerText) || 0;
                const putPrice = parseFloat(rows[i].cells[putPriceColumn].innerText) || 0;

                const callBreakEven = callPrice ? strikePrice + callPrice : 0;
                const putBreakEven = putPrice ? strikePrice - putPrice : 0;

                let callBECell = rows[i].insertCell(strikeColumn);
                callBECell.innerText = callBreakEven.toFixed(2);    
                let putBECell = rows[i].insertCell(strikeColumn+2);
                putBECell.innerText = putBreakEven.toFixed(2);

                //
                const deltaCall = parseFloat(rows[i].cells[deltaCallColumn].innerText) || 0;

                const successCallProbability = deltaCall * 100
                const failCallProbability = (1 - deltaCall) * 100

                let successPutCell = rows[i].insertCell(deltaPutColumn+3);
                successPutCell.innerText = `${successCallProbability.toFixed(0)}% / ${failCallProbability.toFixed(0)}%`

                //
                console.log("MV Debug- callPrice: ", callPrice)
                console.log("MV Debug- underlyingPrice: ", underlyingPrice)
                console.log("MV Debug- strikePrice: ", strikePrice)
                let callIntrinsic = callPrice ? underlyingPrice - strikePrice : 0;
                console.log("MV Debug- callIntrinsic 1: ", callIntrinsic)
                callIntrinsic = callIntrinsic > 0 ? callIntrinsic : 0;
                console.log("MV Debug- callIntrinsic 2: ", callIntrinsic)
                const callExtrinsic = callPrice ? callPrice - callIntrinsic : 0;
                const callExtrPerc = (callExtrinsic/callPrice)*100

                let putIntrinsic = putPrice ? strikePrice - underlyingPrice : 0;
                putIntrinsic = putIntrinsic > 0 ? putIntrinsic : 0;
                const putExtrinsic = putPrice ? putPrice - putIntrinsic : 0;
                const putExtrPerc = (putExtrinsic/putPrice)*100
    
                let intrExtrCallCell = rows[i].insertCell(callPriceColumn+1);
                intrExtrCallCell.innerText = `${callIntrinsic.toFixed(2)}/${callExtrinsic.toFixed(2)} (${callExtrPerc.toFixed(2)}%)`
                let intrExtrPutCell = rows[i].insertCell(putPriceColumn+4);
                intrExtrPutCell.innerText = `${putIntrinsic.toFixed(2)}/${putExtrinsic.toFixed(2)} (${putExtrPerc.toFixed(2)}%)`
            } catch {
                console.log("Error modifying row!");
            }
        }
    }
}

// Function to find and modify tables
function modifyTables() {
    let tables = document.querySelectorAll("table");
    tables.forEach(table => {
        performCalculations(table);
    });
}

// Run the function on page load
window.addEventListener('load', modifyTables);

// Expose the modifyTables function for external use
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runCalculations") {
        modifyTables();
        sendResponse({status: "done"});
    }
});
