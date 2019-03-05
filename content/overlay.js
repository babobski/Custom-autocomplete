xtk.load('chrome://less/content/helper.js');

/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.factif) === 'undefined') extensions.factif = {
	version: '1.0.0'
};
(function() {
	var notify = require("notify/notify"),
		$ = require("ko/dom"),
		self = this,
		editor = require("ko/editor");

	this._calculateXpos = function() {
		var currentWindowPos = editor.getCursorWindowPosition(true);
			
		return currentWindowPos.x;
	}

	this._calculateYpos = function() {
		var currentWindowPos = editor.getCursorWindowPosition(true),
			defaultTextHeight = (ko.views.manager.currentView.scimoz.textHeight(0) - 10);
			
			defaultTextHeight = defaultTextHeight;
		
		return (currentWindowPos.y + defaultTextHeight);
	}

	insertFactifVar = function() {
		var scimoz = ko.views.manager.currentView.scimoz,
			currentLine =	scimoz.lineFromPosition(scimoz.currentPos),
			input = $('#factif_auto');

		if (input.length > 0) {
			var val = input.value(),
				valLength = val.length,
				snippet = null;

			if (valLength > 0) {
				switch (val) {
					case '<!-- BEGIN -->':
						snippet = ko.abbrev.findAbbrevSnippet('BEGIN', 'HTML', 'HTML');
						break;
					case '<!-- IF -->':
						snippet = ko.abbrev.findAbbrevSnippet('IF', 'HTML', 'HTML');
						break;
					case '<!-- INCLUDE -->':
						snippet = ko.abbrev.findAbbrevSnippet('INCLUDE', 'HTML', 'HTML');
						break;
					case '<!-- ELSEIF -->':
						snippet = ko.abbrev.findAbbrevSnippet('ELSEIF', 'HTML', 'HTML');
						break;
					default:
						scimoz.insertText(scimoz.currentPos, val);
						scimoz.gotoPos(scimoz.currentPos + valLength  - (valLength > 13 ? 4 : 0));
						break;
				}
				if (snippet !== null) {
					ko.abbrev.insertAbbrevSnippet(snippet);
				}
			}
			input.parent().remove();
			ko.views.manager.currentView.setFocus();
			
			setTimeout(function(){
				if (scimoz.lineFromPosition(scimoz.currentPos) > currentLine) {
					scimoz.homeExtend();
					scimoz.charLeftExtend();
					scimoz.replaceSel('');
				}
				
			}, 50);
		}
	}

	abortFactifVarCompletion = function() {
		var comp = $('#factif_wrapper');

		if (comp.length > 0) {
			comp.remove();
			ko.views.manager.currentView.setFocus();
		}
	}

	blurFactifComletion = function() {
		clearFactifCompletion = setTimeout(function() {
			abortFactifVarCompletion();
		}, 1000);
	}

	focusFactifCompletion = function() {
		if (typeof clearFactifCompletion !== 'undefined') {
			clearTimeout(clearFactifCompletion);
		}
	}
	
	this._getAutoCompletions = function() {
		return JSON.stringify([
			{"value": "<!-- BEGIN -->"},
			{"value": "<!-- EINDE -->"},
			{"value": "<!-- ELSE -->"},
			{"value": "<!-- ELSEIF -->"},
			{"value": "<!-- ENDIF -->"},
			{"value": "<!-- IF -->"},
			{"value": "<!-- INCLUDE -->"},
		]);
	}

	this.autoComplete = function() {
		var completions = self._getAutoCompletions(),
			mainWindow = document.getElementById('komodo_main'),
			popup = document.getElementById('factif_wrapper'),
			autocomplete = document.createElement('textbox'),
			currentView = ko.views.manager.currentView,
			x = self._calculateXpos(),
			y = self._calculateYpos();

		if (popup == null) {
			popup = document.createElement('tooltip');
			popup.setAttribute('id', 'factif_wrapper');
			autocomplete.setAttribute('id', 'factif_auto');
			autocomplete.setAttribute('type', 'autocomplete');
			autocomplete.setAttribute('showcommentcolumn', 'true');
			autocomplete.setAttribute('autocompletesearch', 'factif-autocomplete');
			autocomplete.setAttribute('highlightnonmatches', 'true');
			autocomplete.setAttribute('ontextentered', 'insertFactifVar()');
			autocomplete.setAttribute('ontextreverted', 'abortFactifVarCompletion()');
			autocomplete.setAttribute('ignoreblurwhilesearching', 'true');
			autocomplete.setAttribute('minresultsforpopup', '0');
			autocomplete.setAttribute('onblur', 'blurFactifComletion()');
			autocomplete.setAttribute('onfocus', 'focusFactifCompletion()');
			popup.appendChild(autocomplete);

			mainWindow.appendChild(popup);
		}

		if (completions.length > 0) {
			if (currentView.scintilla.autocomplete.active) {
				currentView.scintilla.autocomplete.close();
			}
			autocomplete.setAttribute('autocompletesearchparam', completions);
			popup.openPopup(mainWindow, "", x, y, false, false);
			autocomplete.focus();
			autocomplete.value = "<!-- ";
			autocomplete.open = true;
		}

	}
	
	//var features = "chrome,titlebar,toolbar,centerscreen,dependent";
	//this.OpenLessSettings = function() {
	//	window.openDialog('chrome://factif/content/pref-overlay.xul', "lessSettings", features);
	//}
	
}).apply(extensions.factif);












