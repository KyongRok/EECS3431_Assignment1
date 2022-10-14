//York University 3431 3D-Graphics Assignment 1 
//Group Member: KyongRok Kim 215813413, Arian Quader 218070607
var canvas;
var gl;

var program ;

var near = 1;
var far = 100;

// Size of the viewport in viewing coordinates
var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
var controller ;

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse) ;

    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

	
	document.getElementById("sliderXi").oninput = function() {
		RX = this.value ;
		window.requestAnimFrame(render);
	}
		
    
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
        console.log(animFlag) ;
		
		controller = new CameraController(canvas);
		controller.onchange = function(xRot,yRot) {
			RX = xRot ;
			RY = yRot ;
			window.requestAnimFrame(render); };
    };

    render();
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modeling  matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modeling Matrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

// puts the given matrix at the top of the stack MS
function gPut(m) {
	MS.push(m) ;
}

//draws ellipse shapes
function draw_ellipse(){
    gPush();
    {
        gScale(0.15,0.3,0.15);
        drawSphere();
    }
    gPop();
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,20);
    MS = [] ; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4() ;
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	//projectionMatrix = perspective(45, 1, near, far);
    
    // Rotations from the sliders
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    
    // set all the matrices
    setAllMatrices() ;
    
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }
   
    // some colours
    var red = vec4(1.0, 0.0, 0.0, 1.0);
    var grey = vec4(0.5,0.5,0.5,1.0);
    var white = vec4(1,1,1,1.0);
    var black = vec4(0,0,0,1.0);
    var darkGrey = vec4(0.1,0.3,0.1,1.0);
    var darkRed = vec4(0.4,0,0,1.0);
    var purple = vec4(0.48,0.25,0.52,1);
    var green = vec4(0.0,0.52,0.0,1.0);

    gPush();
    { //floor 
		gTranslate(0,-5,0); //move to bottom of the canvas
        gScale(20,1.5,20); //scale respect to x -> stretch side ways, y -> stretch upwards
        setColor(darkGrey) ; //set color as dark grey
        drawCube(); //draw cube
    }
    gPop();
    
    gPush();
    { //big rock
        gTranslate(0,-2.8,0); //move to top of the floor
        gScale(0.7,0.7,0.7); //scale less than 1 so it shrinks from all sides
        setColor(grey); //set color to grey
        drawSphere();
    }
    gPop();

    gPush() ;
    { //small rock
        gTranslate(-1,-3.2,0); //smaller rock
        gScale(0.3,0.3,0.3);
        setColor(grey);
        drawSphere();
    }
    gPop() ;
    
    setColor(green);
    gPush();
    { //seaweed strand 1
        gTranslate(0.7,-2.4,0);
        draw_ellipse();
        addStrands();
    }
    gPop();
    gPush();
    { // seaweed strand 2
        gTranslate(0,-1.8,0);
        draw_ellipse();
        addStrands();
    }
    gPop();
    gPush();
    { // seaweed strand 3
        gTranslate(-0.7,-2.4,0);
        draw_ellipse();
        addStrands();
    }
    gPop();
    
    gPush();
    { //fish
        //vertical movement
        gTranslate(-1, 1*Math.cos(TIME) - 1.5, 2.5);
        //rotation about seaweed and rock
        gTranslate(1, 0, -2.5)
        gRotate(TIME*25, 0, -1, 0);
        gTranslate(-1, 0, 2.5)
        //scale down
        gScale(0.5, 0.5, 0.5);
        gPush();{ //body
            gTranslate(2.5, 0, 0);
            gScale(4, 1, 1);
            gRotate(90, 0, 1, 0);
            setColor(darkRed);
            drawCone();
        }gPop();
        gPush();{ //face
            gRotate(-90, 0, 1, 0);
            setColor(grey);
            drawCone();
        }gPop();
        setColor(black);
        gPush();{ //left pupil
            gTranslate(-0.3, 0.5, 0.5);
            gScale(0.1, 0.1, 0.1);
            drawSphere();
        }gPop();
        gPush();{ //right pupil
            gTranslate(-0.3, 0.5, -0.5);
            gScale(0.1, 0.1, 0.1);
            drawSphere();
        }gPop();
        setColor(white);
        gPush();{ //left eyeball
            gTranslate(-0.1, 0.5, -0.5);
            gScale(0.25, 0.25, 0.25);
            drawSphere();
        }gPop();
        gPush();{ //right eyeball
            gTranslate(-0.1, 0.5, 0.5);
            gScale(0.25, 0.25, 0.25);
            drawSphere();
        }gPop();
        gTranslate(4.25, 0, 0);
        gRotate(50*Math.cos(10*TIME), 0, 1, 0);
        gTranslate(-4.25, 0, 0);
        setColor(darkRed);
        gPush();{ //upper tail
            gTranslate(5.1, 0.75, 0);
            gRotate(45, 0, 0, 1);
            gScale(2, 0.25, 0.25);
            gRotate(90, 0, 1, 0);
            drawCone();
        }gPop();
        gPush();{ //lower tail
            gTranslate(4.8, -0.4, 0);
            gRotate(45, 0, 0, -1);
            gScale(1, 0.25, 0.25);
            gRotate(90, 0, 1, 0);
            drawCone();
        }gPop();
    }gPop();

    gPush();
    {//human aka Character
        //gRotate(330,0,1,0); //rotate whole body
        gScale(0.275,0.275,0.275); //scale
        var pos = 2*Math.cos(TIME)+8;
        gTranslate(pos, pos, -15);
        setColor(purple);
        gPush(); {//head
            drawSphere();
        } gPop();
        gPush();
        {//body
            gScale(2,3,1);
            gTranslate(0,-1.35,0);
            drawCube();
        }
        gPop();
        gPush();{
            //gTranslate(0, -1, 0);
            //gRotate(8*Math.cos(TIME), -1, 0,0);
            //gTranslate(0, 1, 0);
            gPush();
            {//left hip
                gTranslate(-1,-8.5,-1.5);
                gRotate(45,1,0,0);
                gScale(0.4,2,0.4);
                drawCube();
            }
            gPop();
            //gTranslate(0, -1, 0);
            //gRotate(8*Math.cos(TIME), -1, 0,0);
            //gTranslate(0, 1, 0);
            gPush();
            {//left leg
                //gRotate(8*Math.cos(TIME) , -0.5,0,0);
                gTranslate(-1,-10.75,-4.75);
                gRotate(65,1,0,0);
                gScale(0.4,2,0.4);
                drawCube();
            }
            gPop();
            gPush();
            {//left feet
                gTranslate(-1 ,-12 ,-6.5);
                gRotate(335,1,0,0);
                gScale(0.5,1,0.1)
                drawCube();
            }
            gPop();
        }gPop();
        gPush();{
            //gTranslate(0, -1, 0);
            //gRotate(8*Math.cos(TIME), -1, 0,0);
            //gTranslate(0, 1, 0);
            gPush();
            {//right hip
                gTranslate(1,-8.5,-1.5);
                gRotate(45,1,0,0);
                gScale(0.4,2,0.4);
                drawCube();
            }
            gPop();
            //gTranslate(0, -1, 0);
            //gRotate(8*Math.cos(TIME), -1, 0,0);
            //gTranslate(0, 1, 0);
            gPush();
            {//right leg
                gTranslate(1,-10.75,-4.75);
                gRotate(65,1,0,0);
                gScale(0.4,2,0.4);
                drawCube();
            }
            gPop();
            gPush();
            {//right feet
                gTranslate(1 ,-12 ,-6.5);
                gRotate(335,1,0,0);
                gScale(0.5,1,0.1)
                drawCube();
            }
            gPop();
        }gPop();
    }
    gPop();

    gPush();
    {
        setColor(white);
        if(TIME > 2){
            draw_bubble(pos);
        }
    }
    gPop();
    
    if( animFlag )
        window.requestAnimFrame(render);
}

function draw_bubble(pos){ //draws shape of bubble
    gPush();{
        gRotate(330,0,1,0);
        gScale(0.275,0.275,0.275);
        gTranslate(pos, pos, -13);
        gScale(0.1*Math.cos(TIME)+0.5, 0.1*Math.cos(TIME+9)+0.5, 0.5);
        drawSphere();
    }gPop();
}

function addStrands(){
    let sumAngle = 0;
    //ellipses have side to side movement and rotational movements
    for(let i = 1; i <= 8; i++){
        let currAngle = 15*Math.cos(TIME+i);
        gTranslate(0,0.3,0);
        gRotate(currAngle, 0, 0, 1);
        gTranslate(0,0.3,0);
        draw_ellipse();
        sumAngle += currAngle;
    }
    gTranslate(0,0.3,0)
    gRotate(-sumAngle, 0, 0, 1);
    gTranslate(0,0.3,0)
    draw_ellipse();
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
	var controller = this;
	this.onchange = null;
	this.xRot = 0;
	this.yRot = 0;
	this.scaleFactor = 3.0;
	this.dragging = false;
	this.curX = 0;
	this.curY = 0;
	
	// Assign a mouse down handler to the HTML element.
	element.onmousedown = function(ev) {
		controller.dragging = true;
		controller.curX = ev.clientX;
		controller.curY = ev.clientY;
	};
	
	// Assign a mouse up handler to the HTML element.
	element.onmouseup = function(ev) {
		controller.dragging = false;
	};
	
	// Assign a mouse move handler to the HTML element.
	element.onmousemove = function(ev) {
		if (controller.dragging) {
			// Determine how far we have moved since the last mouse move
			// event.
			var curX = ev.clientX;
			var curY = ev.clientY;
			var deltaX = (controller.curX - curX) / controller.scaleFactor;
			var deltaY = (controller.curY - curY) / controller.scaleFactor;
			controller.curX = curX;
			controller.curY = curY;
			// Update the X and Y rotation angles based on the mouse motion.
			controller.yRot = (controller.yRot + deltaX) % 360;
			controller.xRot = (controller.xRot + deltaY);
			// Clamp the X rotation to prevent the camera from going upside
			// down.
			if (controller.xRot < -90) {
				controller.xRot = -90;
			} else if (controller.xRot > 90) {
				controller.xRot = 90;
			}
			// Send the onchange event to any listener.
			if (controller.onchange != null) {
				controller.onchange(controller.xRot, controller.yRot);
			}
		}
	};
}