(function() {//TODO encapsulate ...
  var gf; 
  var ctx = document.getElementById('canvas').getContext('2d');
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
    var cvs = document.getElementById('canvas');
    var ctx = cvs.getContext('2d');
    ctx.clearRect(0,0,cvs.width, cvs.height);
  }

  function setKeys(text) {
    document.removeEventListener('keypress',update);
    
    clear();
    
    var path = gf.getPath(chars.join(''),25,100,88);
    path.fill='crimson';
    path.draw(ctx);
    
    //setup edit els
    drawCtls(path.commands);
    
    //TODO esc (or ?) to toggle ctl visibility
  }

  function drawCtls(cmds) {
    for (var i = 0; i < cmds.length; i++) {
      var cmd = cmds[i];
      switch(cmd.type) {
        case 'M':
        case 'L':
          drawCtl(cmd.x, cmd.y);
          break;
        case 'Q':
          drawCtl(cmd.x, cmd.y, true);
          drawCtl(cmd.x1, cmd.y1);
          break;
        case 'Z': //close 
          break;
        default: //just in case
          console.log(cmd);
          break;
      }
    }
  }
  
  function drawCtl(x,y, isCtlPt) {
    var svgNS = "http://www.w3.org/2000/svg";
    var el = document.createElementNS(svgNS, "circle");
    el.r.baseVal.value=2;
    el.cx.baseVal.value = x;
    el.cy.baseVal.value = y;
    el.setAttribute('stroke',isCtlPt ? 'lightyellow' : 'steelblue');
    el.setAttribute('fill','transparent' );
    svg.appendChild(el);
    el.addEventListener('click',function(e){console.log(e.target)});//TODO setup drag to update pt & path
    return el;
  }
})();