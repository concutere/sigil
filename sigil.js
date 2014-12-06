(function() {//TODO encapsulate ...
  var gf; 
  var cvs = document.getElementById('canvas');
  var ctx = cvs.getContext('2d');
  var svg = document.getElementById('svg');
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
          path.draw(ctx);
      }
  });

  var text="";
  var chars=[];
  var cPaths=[]; //TODO use for animating transition from user's statement text into set of letters
  var showpath;
  document.addEventListener('keypress',update);
  function update(e) {
    if (text=="") {
      clear();
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
    var path = gf.getPath(text,25,200,36);
    path.fill='crimson';
    clear();
    path.draw(ctx);
  }

  function clear() {
    ctx.clearRect(0,0,cvs.width, cvs.height);
  }

  function setKeys(text,skipCtls) {
    document.removeEventListener('keypress',update);
    
    clear();
    
    var path = gf.getPath(chars.join(''),25,100,88);
    path.fill='crimson';
    path.draw(ctx);
    showpath=path;
    //setup edit els
    if(!skipCtls) {
      drawCtls(path.commands);
    }
    
    //TODO esc (or ?) to toggle ctl visibility
  }

  function drawCtls(cmds) {
    for (var i = 0; i < cmds.length; i++) {
      var cmd = cmds[i];
      switch(cmd.type) {
        case 'M':
        case 'L':
          drawCtl(i,cmd.x, cmd.y);
          break;
        case 'Q':
          drawCtl(i,cmd.x, cmd.y, true);
          drawCtl(i,cmd.x1, cmd.y1);
          break;
        case 'Z': //close 
          break;
        default: //just in case
          console.log(cmd);
          break;
      }
    }
  }
  
  function drawCtl(id,x,y, isCtlPt) {
    var svgNS = "http://www.w3.org/2000/svg";
    var el = document.createElementNS(svgNS, "circle");
    el.id='ctl'+id;
    el.r.baseVal.value=2;
    el.cx.baseVal.value = x;
    el.cy.baseVal.value = y;
    el.setAttribute('stroke',isCtlPt ? 'lightyellow' : 'steelblue');
    el.setAttribute('fill','transparent' );
    svg.appendChild(el);
    el.addEventListener('mousedown',mousedown);//TODO setup drag to update pt & path
    el.addEventListener('mouseup',mouseup);
    return el;
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
    var id=dragel.id.substr(3);
    {dragel=undefined;}
    showpath.commands[id].x += lastpos[0]-downpos[0];
    showpath.commands[id].y += lastpos[1]-downpos[1];
    
    clear();
    showpath.draw(ctx);
    
  }
})();