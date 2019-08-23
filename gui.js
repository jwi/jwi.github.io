$(document).ready(function () {
	var flagDistIndex = 0;
	var possibleFlagDists;
	var showing = false;
	var showingHeatmap = false;
	
	var showCurrentFlagDist = function () {
		if (!possibleFlagDists.dists[flagDistIndex])
			return;
		showFlagDist(possibleFlagDists.dists[flagDistIndex]);
		
		$('#distCounter').text((flagDistIndex+1) + '/' + possibleFlagDists.dists.length);
	};
	
	var showCurrentHeatmap = function () {
		if (!possibleFlagDists)
			return;
		showHeatmap(possibleFlagDists.dists, possibleFlagDists.consideredCells);
	};
	
	$('#btnFindMineDist').click(function (e) {
		if (!showing) {
			possibleFlagDists = findPossibleFlagDistributions(getAllNumberTiles());
			showCurrentFlagDist();
			showing = true;
			
			$('#mineDistSelector').show();
			$(this).text('Hide possible mine distributions');
		} else {
			removeQuestionMarks();
			showing = false;
			
			
			$('#mineDistSelector').hide();
			$(this).text('Show possible mine distributions');
		}			
	});
	
	$('#btnPrevMineDist').click(function (e) {
		if (flagDistIndex > 0) {
			flagDistIndex--;
		} else {
			flagDistIndex = possibleFlagDists.dists.length-1;
		}
		
		showCurrentFlagDist();
	});
	
	$('#btnNextMineDist').click(function (e) {
		if (flagDistIndex < possibleFlagDists.dists.length-1) {
			flagDistIndex++;
		} else {
			flagDistIndex = 0;
		}
		showCurrentFlagDist();
	});
	
	$('#btnShowHeatmap').click(function () {
		showingHeatmap = !showingHeatmap;
		
		if (showingHeatmap) {
			showCurrentHeatmap();
		} else {
			hideHeatmap();
		}
	});
	
	var cellClickHandler = function (e) {
		possibleFlagDists = findPossibleFlagDistributions(getAllNumberTiles());
		
		if (showingHeatmap) {
			showCurrentHeatmap();
		}
		
		if (showing) {
			showCurrentFlagDist();
		}
	};
	
	$('#minefield div').bind('click', cellClickHandler);
	
	m.$resetButton.bind('click', function (e) {
		if (e.which === 3) return false;
		
		$('#minefield div').bind('click', cellClickHandler);
		hideHeatmap();
		removeQuestionMarks();
		possibleFlagDists = null;
	});
});