/*global define, brackets */
//http://brackets.io/docs/current/modules/editor/Editor.html

define(function (require,exports,module) {

;(function addRuntimeAutocompleteToBrackets(){
var CodeHintManager=brackets.getModule('editor/CodeHintManager')
    ,editor
    ,jsonEndpoint=localStorage.runtimeEndpoint || "//"+location.hostname+":8000/repl"
    ,getLine=()=>{
        var cursor=editor.getCursorPos()
            ,line=editor.document.getRange({line: cursor.line,ch: 0}, cursor)
        return line
    }
    ,lastPartial
    ,body=$("body")
    ,lastDefer
    ,lastSuggestTimer
    if(localStorage.isRuntimeSuggestOn) body.addClass("runtime-suggest")

//for some reason brackets proxies xhr via $.ajax, so need alternative
!function(){function e(){}function n(n,o,i){function r(){u.parentNode&&u.parentNode.removeChild(u),window[d]=e,a&&clearTimeout(a)}function c(){window[d]&&r()}"function"==typeof o&&(i=o,o={}),o||(o={});var u,a,m=o.prefix||"__jp",d=o.name||m+t++,f=o.param||"callback",p=null!=o.timeout?o.timeout:6e4,l=encodeURIComponent,w=document.getElementsByTagName("script")[0]||document.head;return p&&(a=setTimeout(function(){r(),i&&i(new Error("Timeout"))},p)),window[d]=function(e){r(),i&&i(null,e)},n+=(~n.indexOf("?")?"&":"?")+f+"="+l(d),n=n.replace("?&","?"),u=document.createElement("script"),u.src=n,w.parentNode.insertBefore(u,w),c}var t=0;window.jsonp=n}();

CodeHintManager.registerHintProvider({
    hasHints: function(Editor, implicitChar) {
        editor=Editor
        var line=getLine()
        //console.log(implicitChar,line)
        return !!localStorage.isRuntimeSuggestOn//implicitChar===null// || !!line.match(/\.\s*$/) || !!(implicitChar==".")// && !((line.replace(/\(\[|\)\]/g,'').length-line.length)%2) )
    },
    getHints: function(implicitChar) {
        var line=getLine()
            ,def=$.Deferred()
        if(lastDefer) lastDefer.reject()
        lastDefer=def
        if(lastSuggestTimer) clearTimeout(lastSuggestTimer)
        lastSuggestTimer=setTimeout(()=>{
            lastPartial=line.split(".").pop().replace(/\(|\)/g,'')
            //console.log(implicitChar,line)
            jsonp(jsonEndpoint+"?q="+line,(err,ok)=>{
                if(err) def.reject(err)
                else def.resolve({
                    hints:(ok.hints||[]).map(x=>$("<span class=suggest-option />").html(`
                            <span class=suggestion >${x.text.replace(new RegExp("^"+lastPartial,"i"),`<strong class=rmv >${lastPartial}</strong>`)}</span>
                            <span class=source >${x.source}</span>
                            <code>${x.type!='function' ? x.val : x.val.substr(0,x.val.indexOf("\n")).replace(new RegExp("^\\s*function\\s*"+x.text+"|\\s*function\\s*","gi"),"")}</code>
                            <span class=type >${x.type}</span>
                            <span style=display:none class=desc >${x.doc.length ? x.doc[0].description : '?'}</span>
                            <json style=display:none >${JSON.stringify(x.doc)}</json>
                        `)[0].outerHTML)
                    ,match:null
                    ,selectInitial:true
                    ,handleWideResults:false
                })
            })
        },250)
        return def
    },
    insertHint: function(hint) {
        if (!editor) return

        var start = editor.getCursorPos()
            ,end = editor.getCursorPos()
            ,name=$(hint).find(".suggestion").text()
            ,toAdd=(name+'').replace(new RegExp("^"+lastPartial),"")
            ,type=$(hint).find(".type").text()
            ,code=$(hint).find("code:first").text()
        //is this a function? If so, place (vars) and highlight ... ugh
        //console.log(hint)
        window.ed=editor
        if(type=='function' && name!='constructor'){
            var inputs=code.split(/[()]/)[1]
                ,el=inputs.split(",")[0].length
            //console.log(inputs,el,start,end)
            editor.document.replaceRange( toAdd+`(${inputs})`, start,end)
            editor.selectWordAt({line:start.line,ch:start.ch+toAdd.length+1})
        }
        else editor.document.replaceRange( toAdd, start, end)
    },
    insertHintOnTab:true
}, ["javascript"], 1)

    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Menus          = brackets.getModule("command/Menus"),
        COMMAND_ID     = "runtime.suggest",
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
                  path = ExtensionUtils.getModulePath(module)
    ExtensionUtils.addLinkedStyleSheet(path + "style.css")

    CommandManager.register("Toggle Runtime Suggest", COMMAND_ID, ()=>{
        localStorage.isRuntimeSuggestOn = localStorage.isRuntimeSuggestOn ? "" : 1
        body.toggleClass("runtime-suggest")
        //console.log("runtime suggest on?",localStorage.isRuntimeSuggestOn ? "" : 1)
    })
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU)
    menu.addMenuItem(COMMAND_ID, [{ "key": "Ctrl-Shift-A" }])

})()


});