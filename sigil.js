(function() {//TODO encapsulate ...
  var svgNS = "http://www.w3.org/2000/svg";
  var gf; 
  /* keeping these around in case canvas rendering becomes relevant again ...
  var cvs;// = document.getElementById('canvas');
  var ctx;// = cvs.getContext('2d'); //
  */
  var svg = document.getElementById('svg');
  var gPath = document.getElementById('gPath');
  var gCtls = document.getElementById('gCtls');

  opentype.load('fonts/Roboto-Black.ttf', function (err, font) {
      if (err) {
           alert('Font could not be loaded: ' + err);
      } else {
          gf=font;

          // Construct a Path object containing the letter shapes of the given text.
          // The other parameters are x, y and fontSize.
          // Note that y is the position of the baseline.
          var path = font.getPath('TYPE HERE', 25, 150, 72);
          // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
          path.fill='CRIMSON';
          path.drawSVG(gPath);
      }
  });

  var text="";
  var chars=[];
  var cPaths=[]; //TODO use for animating transition from user's statement text into set of letters
  var showpath;
  var showCtls = true;

  document.addEventListener('keydown',handleCmd);
  function handleCmd(e) {
    if (e.keyCode === 8) {
      e.preventDefault();
      //DELETE CHAR
      chars.pop();
      if (text.length > 1) text = text.substr(0,text.length-1);
      drawTypedText();
      return false;
    }
    if (e.keyCode === 27) {
      showCtls = !showCtls;
      reshowCtls();
    }
  }

  document.addEventListener('keypress',update);
  function update(e) {
    if (text=="") {
      clearPath();
    }
    else if (e.keyCode == 13) { //enter key
      setKeys(text);
      return;
    }

    var c = String.fromCharCode(e.keyCode);
    if (([' ', '\n', '\t']).indexOf(c) < 0 && chars.indexOf(c) < 0) {
      chars.push(c);
      /*var path=gf.getPath(c, 25,100,72);
      path.fill='crimson';
      cPaths.push(path);*/
    }
    text+=c;
    drawTypedText();
  }

  function drawTypedText() {
    var path = gf.getPath(text,25,200,36);
    path.fill='crimson';
    clearPath();
    path.drawSVG(gPath);
  }

  function clear() {
    ctx.clearRect(0,0,cvs.width, cvs.height);
  }

  function clearPath() {
    clearsvg(gPath);
  }
  function clearCtls() {
    clearsvg(gCtls);
  }
  
  function clearsvg(svg) {
    while(svg.lastChild) {
      svg.removeChild(svg.lastChild);
    }
  }

  function setKeys(text,skipCtls) {
    document.removeEventListener('keypress',update);
    
    clearPath();
    
    var path = gf.getPath(chars.join(''),25,100,88);
    path.fill='crimson';
    path.drawSVG(gPath);
    showpath=path;
    //setup edit els
    if(!skipCtls) {
      clearCtls();
      drawCtls(path.commands);
    }

    gPath.addEventListener('dblclick',editPathColor);

    svg.addEventListener('dblclick',function(e) {if(e.target.constructor.name=="SVGSVGElement") { showCtls = !showCtls; reshowCtls(); }});
  }

  function editPathColor(e) {
    if (e.target.getAttribute('fill')=='crimson') {
      e.target.setAttribute('fill', 'forestgreen');
    }
    else {
      e.target.setAttribute('fill', 'crimson');
    }
  }

  function reshowCtls() {
    //actually just toggles visibility ...
    var ctls = document.getElementsByClassName('ctl');
    for(var i=0; i <ctls.length; i++) {
      var ctl = ctls[i];
      ctl.style.visibility = showCtls ? 'visible' : 'hidden';
    }
  }

  function drawCtls(cmds) {
    for (var i = 0; i < cmds.length; i++) {
      var cmd = cmds[i];
      switch(cmd.type) {
        case 'M':
        case 'L':
          drawCtl(i,cmd, cmd.x, cmd.y);
          break;
        case 'Q':
          drawCtl(i,cmd, cmd.x, cmd.y);
          drawCtl(i+.1, cmd, cmd.x1, cmd.y1);
          break;
        case 'Z': //close 
          break;
        default: //just in case
          console.log(cmd);
          break;
      }
    }
  }
  
  function drawCtl(id,cmd, x, y) {
    var isCtlPt = parseFloat(id) != Math.floor(id);
    var i = parseInt(Math.floor(id));
    var el = document.createElementNS(svgNS, "circle");
    el.id='ctl'+id;
    el.r.baseVal.value=isCtlPt ? 3.5 : 4;
    el.cx.baseVal.value = x;
    el.cy.baseVal.value = y;
    el.setAttribute('class','ctl');
    el.setAttribute(isCtlPt ? 'stroke' : 'fill','azure');
    if (isCtlPt) {
      el.setAttribute('fill','transparent');
      el.setAttribute('stroke-opacity', '0.5');
    }
    else {
      el.setAttribute('fill-opacity', '0.5');
    }

    gCtls.appendChild(el);
    el.addEventListener('mousedown',mousedown);
    el.addEventListener('mouseup',mouseup); //TODO handle like mousemove (?)
    el.addEventListener('dblclick',delEl);
    return el;
  }
  
  function delEl(e) {
    var id = e.target.id.substr(3);
    if (!isNaN(id) && id > -1) {
      var i = parseInt(Math.floor(id));
      var cmd = showpath.commands[i];
      showpath.commands.splice(i,1);

      clearPath();
      clearCtls();
      showpath.drawSVG(gPath);
      drawCtls(showpath.commands);
    }
  }
  
  //TODO encapsulate ...
  var downpos=[0,0];
  var lastpos=[0,0];
  var dragel=undefined;
  function mousedown(e) {
    lastpos=downpos=[e.x,e.y];
    document.addEventListener('mousemove',mousemove);
    dragel=e.target;
  }
  
  function mousemove(e) {
    shiftPos(e.x,e.y,dragel);
  }
  
  function shiftPos(x,y,target) {
    if (!target || !target.cx) {
      console.log('wtf');
      return;
    }
    var newpos=[x,y];
    target.cx.baseVal.value += newpos[0]-lastpos[0];
    target.cy.baseVal.value += newpos[1]-lastpos[1];
    lastpos=newpos;
  }
  
  function mouseup(e) {
    document.removeEventListener('mousemove',mousemove);
    shiftPos(e.x,e.y,dragel);
    var type = dragel.id.substr(0,1);
    var id=dragel.id.substr(3);

    var i = parseInt(Math.floor(id));
    if (parseFloat(id) != Math.floor(id)) {
      showpath.commands[i].x1 = dragel.cx.baseVal.value;
      showpath.commands[i].y1 = dragel.cy.baseVal.value;
    }
    else {
      showpath.commands[i].x = dragel.cx.baseVal.value;
      showpath.commands[i].y = dragel.cy.baseVal.value;
    }
    {dragel=undefined;}    
    clearPath();
    showpath.drawSVG(gPath);
    
  }
})();