var m = minesweeper;
// Indexing: (1,1) is top left

// Highlighting a cell: minesweeper.cells[1][1].$elem.css({'background':'red'});


// Step 1: identify the "front"
function getFront() {
	var front = [];
	// First loop over all cells
	for ( row = 1; row <= m.numRows; row++ ) {
		for ( col = 1; col <= m.numCols; col++ ) {
			var c = m.cells[row][col];
			if (!c.covered && c.numSurroundingMines > 0) {
				// Then for each cell, loop over surrounding cells
				for (i = row - 1; i <= row + 1; i++) {
					for (j = col - 1; j <= col + 1; j++) {
						// applying to surrounding cells, but we skip actual cell
						if (i == row && j == col) { continue; }
						
						
						if (m.cells[i][j].$elem && m.cells[i][j].covered) {
							// m.cells[i][j].$elem.css({'background':'blue'});
							front.push(m.rowColToNum(i,j));
						}
					}
				}
			}
		}
	}
	
	return front;
}

// Identifying the number of free neigbors for all the uncovered number tiles
function findFreeNeighbors() {
	// First loop over all cells
	for ( row = 1; row <= m.numRows; row++ ) {
		for ( col = 1; col <= m.numCols; col++ ) {
			var c = m.cells[row][col];
			c.numFreeNeighbors = undefined;
			if (!c.covered && c.numSurroundingMines > 0) {
				// Then for each cell, loop over surrounding cells
				for (i = row - 1; i <= row + 1; i++) {
					for (j = col - 1; j <= col + 1; j++) {
						// applying to surrounding cells, but we skip actual cell
						if (i == row && j == col) { continue; }
						
						c2 = m.cells[i][j];
						
						if (c2.$elem && c2.covered && c2.flagStateIndex === 0) {
							c.numFreeNeighbors++;
							
						}
					}
				}
			}
		}
	}
}

// Identifying the number of free neigbors for all the uncovered number tiles
function getAllNumberTiles() {
	var numberTiles = [];
	// First loop over all cells
	for ( row = 1; row <= m.numRows; row++ ) {
		for ( col = 1; col <= m.numCols; col++ ) {
			var c = m.cells[row][col];
			if (!c.covered && c.numSurroundingMines > 0) {
				numberTiles.push(m.rowColToNum(row, col));
			}
		}
	}
	return numberTiles;
}

// To create a valid potential distribution:
// 1 Pick a number cell
// 2 If it is not already satisfied, try to satisfy it by placing flags
// 3 Check for conflicts
// 3.1 If there is a conflict, try to satisfy this number cell another way
// 3.2 If there is no conflict, move on to the next number cell

// To create a valid potential distribution:
// For each number cell,
// 		If it is not already satisfied, try to satisfy it by placing flags

/* function findPossibleFlagDistributions(numberCells) {
	var currNC = numberCells.slice();
	var origNC = numberCells.slice();
	return _findPossibleFlagDistributions(currNC, origNC);
} */

function findPossibleFlagDistributions(numberCells) {
	var consideredCells = numberCells.map(getCoveredNeighbors).flat().filter((x,i,s) => s.indexOf(x) === i);
	return {dists: _findPossibleFlagDistributions(numberCells, [], []), consideredCells: consideredCells};
}

var _findPossibleFlagDistributions = function (numberCells, flagged, cleared) {
	if (numberCells.length === 0) return [flagged];
	
	// Just copy these real quick so there's no funny business
	var ncs = numberCells.slice(1); // make a smaller numbercells array
	var cnc = numberCells[0]; // get the first numbercell
	
	// For this number cell,
	var sn = getCoveredNeighbors(cnc); // Get ids of sweepable neigbors (from the game)
	var fn = sn.filter(x => !flagged.includes(x) && !cleared.includes(x)); // Remove the cells which have already been considered
	var alreadyFlagged = sn.filter(x => flagged.includes(x)).length; // Amount of flags that have already been placed in this vincinity
	var flagsToPlace = cellById(cnc).numSurroundingMines - alreadyFlagged;
	var ret = [];
	
	if (flagsToPlace > fn.length) {
		// We cannot fulfill this number cell since there are more flags to place than space for flags
		return [];
	} else if (flagsToPlace == 0) {
		// We have nothing to do on this number cell since it is already fulfilled
		var nextLevel = _findPossibleFlagDistributions(ncs, flagged, cleared.concat(fn));
		ret = ret.concat(nextLevel);
		return ret;
	} else {
		var flagDistributions = combinations(fn, flagsToPlace);
		if (flagDistributions.length === 0) {
			// console.log(fn, flagsToPlace);
		} else {
			for (var i = 0; i < flagDistributions.length; i++) {
				var newFlagged = flagged.concat(flagDistributions[i]);
				var newCleared = cleared.concat(fn.filter(x => !flagDistributions[i].includes(x)));
				
				var nextLevel = _findPossibleFlagDistributions(ncs, newFlagged, newCleared);
				ret = ret.concat(nextLevel);
			}
		}
		
		return ret;
	}
};

// var _findPossibleFlagDistributions = function (currNumberCells, origNumberCells) {
	// if (currNumberCells.length === 0) return [];
	
	// var finalDistributions = [];
	
	// console.log('Recursion level', currNumberCells.length);
	
	// var cnc = currNumberCells[0]; // Current number cell (CNC)
	
	// console.log('Checking number cell at ', m.numToRowCol(cnc));
	/* 
	Get all possible distributions of flags amongst the free neighbors
	such that the number of surrouding mines is satisfied */
	// var fn = getFreeNeighbors(cnc);
	// var numSurroundingFlags = getFlaggedNeighbors(cnc);
	// var k = cellById(cnc).numSurroundingMines - numSurroundingFlags;
	// var flagDistributions = combinations(fn, k);
	
	// if (flagDistributions.length === 0) {
		// This number cell is already fine, so we do nothing and just recurse
		// return _findPossibleFlagDistributions(currNumberCells.slice(1), origNumberCells);
	// }
	
	// console.log('Found flag distributions: ', flagDistributions);
	
	// for (var i = 0; i < flagDistributions.length; i++) { // Loop over flag distributions
		// var flagDistribution = flagDistributions[i]; // Indices of cells to flag to satisfy the CNC
		// console.log('Trying flag distribution ', flagDistribution);
		
		// Flag the relevant cells so that they will not be considered further on
		// for (var j = 0; j < fn.length; j++) {
			// var index = fn[j];
			// var cell = cellById(index);
			// cell.flagStateIndex = flagDistribution.includes(index) ? 1 : 2; // Flag cell if needed
			// cell.$elem.attr('class', m.flagStates[ (cell.flagStateIndex) ]); // Update graphics
		// }
				
		// var valid = checkFlagDistribution(origNumberCells); // Did this move violate any number tiles?
		// if (valid) {
			// console.log('Valid!');
			
			// var tail = _findPossibleFlagDistributions(currNumberCells.slice(1), origNumberCells);
			// if (tail.length > 0) {
				// console.log('Dit is de tail ', tail);
				// var ugh = tail.map(t => t.concat(flagDistribution)); // Append the distribution of this recursion level to all those of the next level
				// finalDistributions = finalDistributions.concat(ugh);
			// } else {
				// finalDistributions.push(flagDistribution);
			// }
		// } else {
			// console.log('Invalid! Abort this path.');
			// continue;
		// }
	// }
	
	// return finalDistributions;
// };

function getNeighbors(cellId, filterFunc) {
	/* Gets the neighbors of a cell identified by cellId.
	filterFunc can be passed, which takes a neighbor cell and returns a boolean which determines if it is included */
	
	[row, col] = m.numToRowCol(cellId); // number cell index to rowcol coordinates
	var cell = m.cells[row][col];
	var neighbors = []; // neighbors
	
	// Loop over surrounding cells and identify free neighbors
	for (i = row - 1; i <= row + 1; i++) {
		for (j = col - 1; j <= col + 1; j++) {
			if (i == row && j == col) { continue; } // Skip cell itself
			
			var c2 = m.cells[i][j];
			
			if (!c2.$elem) continue;
			if (filterFunc !== undefined && !filterFunc(c2)) continue; // if there is a filter function which the neighbor does not pass
				
				
			neighbors.push(m.rowColToNum(i, j));
		}
	}
	
	return neighbors;
}

function getCoveredNeighbors(nc) {
	return getNeighbors(nc, cell => cell.covered);
}

function getFreeNeighbors(nc) {
	return getNeighbors(nc, cell => cell.covered && cell.flagStateIndex === 0);
}

function getFlaggedNeighbors(nc) {
	return getNeighbors(nc, cell => cell.covered && cell.flagStateIndex !== 0);
}

function cellById(id) {
	[row,col] = m.numToRowCol(id);
	return m.cells[row][col];
}

function checkFlagDistribution(numberCells) {
	// Loop over number cells
	for (var i = 0; i < numberCells.length; i++) {
		// If a number cell has too many flags, return false
		if (getFlaggedNeighbors(numberCells[i]).length > cellById(numberCells[i]).numSurroundingMines) return false;
	}
	
	return true;
}

var combinations = function(arr, k) {
	/* Function that returns all possible draws of k elements from the array arr */
	
	if (k == 0) return [];
	if (k == 1) return arr.map(x => [x]); // For k == 1 return singletons
	
	var combos = [];
	var arr2 = arr.slice(); // Clone the array so that the original doesn't become empty after shifting
	
	while (arr2.length > 0) {
		var a = arr2.shift(); // get the first element
		var c = combinations(arr2, k-1); // recurse on the smaller list with k - 1 since we chose one just then
		c.forEach(x => x.unshift(a)); // add the shifted element to the beginning of each combo from the recursion
		combos = combos.concat(c); // save the found combinations
	}
	
	return combos;
}

function removeQuestionMarks() {
	for ( row = 1; row <= m.numRows; row++ ) {
		for ( col = 1; col <= m.numCols; col++ ) {
			var c = m.cells[row][col];
			if (c.covered && c.flagStateIndex == 2) {
				c.flagStateIndex = 0;
				c.$elem.attr('class', m.flagStates[0]);
			}
		}
	}
}

function showFlagDist(flagIndices) {
	// Reset all flags
	for ( row = 1; row <= m.numRows; row++ ) {
		for ( col = 1; col <= m.numCols; col++ ) {
			var c = m.cells[row][col];
			if (c.covered) {
				c.flagStateIndex = 0;
				c.$elem.attr('class', m.flagStates[0]);
			}
		}
	}
	
	flagIndices.forEach(function (flag) {
		cellById(flag).flagStateIndex = 2;
		cellById(flag).$elem.attr('class', m.flagStates[2]);
	});
}

function histCounts(arr) {
    var a = [], b = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }

    return [a, b];
}

function heatMapColorforValue(value){
	// Veridis:
	/* var colors = [[68,1,84], [72,36,117], [65,68,135], [53,95,141], 
		[42,120,142], [33,144,141], [34,168,132], [66,190,113], 
		[122,209,81], [189,223,38], [189,223,38]]; */
		
	// Spectral:
	var colors = [[158,1,66], [209,59,75], [240,112,74], [252,171,99], [254,220,140], [251,248,176], [224,243,161], [170,221,162], [105,189,169], [66,136,181], [66,136,181]];
	colors = colors.reverse(); // So that higher is redder
	var colorIndices = colors.map((x, i, s) => i/(s.length-1)); // split [0,1] into equidistant x values corresponding to each color
	
	var color;
	var i = colorIndices.indexOf(value);
	if (i !== -1) {
		// The value coincides with one of the grid points, so we do not have to interpolate
		color = colors[i];
	} else {
		// We have to interpolate
		var bi = colorIndices.findIndex(x => (value <= x)); // Index of the grid point to the right of the value
		var xb = colorIndices[bi], 		// right grid point
			xa = colorIndices[bi - 1], 	// left grid point
			b = colors[bi], 			// right color
			a = colors[bi - 1];			// left color
		var factor = (value - xa)/(xb - xa);
		color = _interpolateColor(a, b, factor);
	}
	
	return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
	
	
	/* var h = (1.0 - value) * 240;
	return "hsla(" + h + ", 100%, 50%, 50%)"; */
}

function showHeatmap(dists, consideredCells) {
	hideHeatmap(); // first clear any previous heatmap
	var flagIds, counts;
	
	[flagIds, counts] = histCounts(dists.flat());
	var safeIds = consideredCells.filter(x => !flagIds.includes(x));
	var ids = flagIds.concat(safeIds);
	counts = counts.concat(safeIds.slice().fill(0));
	var normCounts = counts.map(x => x/dists.length); // normalize, i.e. rescale range to [0, 1]
	
	// console.log(ids, ncounts);
	for (var i = 0; i < ids.length; i++) {
		var cell = cellById(ids[i]);
		cell.$elem.css({'background-color': heatMapColorforValue(normCounts[i])});
	}
}

function hideHeatmap() {
	$('#minefield div').css({'background-color': 'transparent'});
}

// Hoe krijg je een juiste vlaggenverdeling?

// Begin bij een nummertje.
// Kijk voor dit nummertje welke bedekte buren hij heeft
	// Deze informatie kan je uit het spel zelf halen, hoef je niet voor in je eigen algoritme te kijken
// Kijk welke vlaggen er tussen deze buren staan
	// Je moet dus elke stap weten wat er de vorige stappen al behandeld is (vlaggen en niet-vlaggen)
// Trek van deze buren de hokjes af die al behandeld zijn (vlaggen of leegte)
// Trek het aantal reeds geplaatste vlaggen van het aantal te plaatsen vlaggen af
// Als het aantal te plaatsen vlaggen groter is dan het aantal hokjes dat nog over is, dan kan deze niet
// Anders, bereken de mogelijke vlagverdelingen over de beschikbare hokjes
// Kies zo'n verdeling en voeg de keuzes voor vlaggen en niet-vlaggen toe aan 