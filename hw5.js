function setup() {

	// Canvas variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

	// Slider variables
    var sliderX = document.getElementById('sliderX');
    sliderX.value = 50;
    var sliderY = document.getElementById('sliderY');
    sliderY.value = 50;

	// Keyboard variables
	var keyW = false;
	var keyA = false;
	var keyS = false;
	var keyD = false;
	var displacementLR = 0;
	var speedOfDisplacementLR = -3;


	// Sphere variables
	var ballRotationTransform = mat4.create();
	var diameterOfSphere = 8.0;
	var degIntervals = 30;
	var degD = 0;
	var speedOfDegRotationLR = 10;

	var degOfForwardRotation = 10;
	var sphereAnimatorTracker = null;
	var speedOfSphereRender = 30;

	// Pillar variables
	var pillarAnimatorTracker = null;
	var pillarGeneratorTracker = null;
	var speedOfPillarRender = 200;
	var speedOfPillarGenerator = 3000;

	var posXPillar = 0;
	var arrayOfPillarXDisplacements = [0, 10, -10, 20, -30];
	var arrayOfPillarZDisplacements = [250, 280, 290, 330];

	var posZPillar = 250;
	var displacementZPillar = 10;

	

	var pillarQueue = [];

	class Pillar{
		constructor(x, y, z, color, generateStatus){
			this.posX = x;
			this.posY = y;
			this.posZ = z;
			this.color = color;
			this.generateStatus = generateStatus;
		}
	}



	// runway variables
	var widthOfRunWay = 27;

	// Functions

	// PillarGenerator
	function pillarGenerator(){
		// function is called periodically

		// add pillar object into queue
		posXPillar = Math.floor(Math.random() * (arrayOfPillarXDisplacements.length - 0) + 0);

		posZPillar = Math.floor(Math.random() * (arrayOfPillarZDisplacements,length - 0) + 0);

		var newPillar = new Pillar(arrayOfPillarXDisplacements[posXPillar], 0, arrayOfPillarZDisplacements[posZPillar], "black", false);

		pillarQueue.push(newPillar);


	}

	
	// This function draws onto canvas
    function draw() {
		canvas.width = canvas.width;

		// use the sliders to get the angles
		var viewAngle = sliderY.value*0.02*Math.PI;

		// Draw stroke functions
		function moveToTx(loc,Tx)
		{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}

		function lineToTx(loc,Tx)
		{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}

		
		function CircleY(t){
			//var result = [10.0*Math.cos(2.0*Math.PI*t),8.0*t,10.0*Math.sin(2.0*Math.PI*t)];
			var result = [diameterOfSphere*Math.cos(2.0*Math.PI*t),0,diameterOfSphere*Math.sin(2.0*Math.PI*t)];
			// var l = t// longitude
			// var c = t// colatitude
			// var result = [10.0*Math.cos(l)*Math.sin(c/2), 10.0*Math.sin(l)*Math.sin(c/2), 10.0*Math.cos(c/2)];
			return result;
		}

		function CircleX(t){
			//var result = [10.0*Math.cos(2.0*Math.PI*t),8.0*t,10.0*Math.sin(2.0*Math.PI*t)];
			var result = [0, diameterOfSphere*Math.cos(2.0*Math.PI*t),diameterOfSphere*Math.sin(2.0*Math.PI*t)];
			return result;
		}

		function CircleZ(t){
			//var result = [10.0*Math.cos(2.0*Math.PI*t),8.0*t,10.0*Math.sin(2.0*Math.PI*t)];
			var result = [diameterOfSphere*Math.cos(2.0*Math.PI*t),diameterOfSphere*Math.sin(2.0*Math.PI*t,0)];
			return result;
		}

		function drawRunway(color, Tx){
			context.beginPath();
	    	context.strokeStyle = color;

			var elevation = -5;

			// drawn on x, z plane

			// Runway in front of the ball
			// Right edge
			moveToTx([widthOfRunWay, elevation, 0], Tx);
			lineToTx([widthOfRunWay, elevation, 30], Tx)

			// Left edge
			moveToTx([-widthOfRunWay, elevation, 0], Tx);
			lineToTx([-widthOfRunWay, elevation, 30], Tx)

			// Runway behind the ball
			// Right edge
			moveToTx([widthOfRunWay, elevation, 0], Tx);
			lineToTx([widthOfRunWay, elevation, -30], Tx)

			// Left edge
			moveToTx([-widthOfRunWay, elevation, 0], Tx);
			lineToTx([-widthOfRunWay, elevation, -30], Tx)

			
			// Border lines
			moveToTx([widthOfRunWay, elevation, 30], Tx);
			lineToTx([-widthOfRunWay, elevation, 30], Tx)

			moveToTx([widthOfRunWay, elevation, -30], Tx);
			lineToTx([-widthOfRunWay, elevation, -30], Tx)

			context.stroke();
		}


		function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
			context.strokeStyle=color;
			context.beginPath();
			moveToTx(C(t_begin),Tx);
			for(var i=1;i<=intervals;i++){
				var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
				lineToTx(C(t),Tx);
			}
			context.stroke();
		}

		function DrawVerticalPillar(color, Tx, posX, posY, posZ){
			context.beginPath();
	    	context.strokeStyle = color;

			posZPillar -= displacementZPillar;

			var positionOfPillar = mat4.create();
			//mat4.fromTranslation(positionOfPillar, [arrayOfPillarXDisplacements[posXPillar], 0, posZPillar]);
			mat4.fromTranslation(positionOfPillar, [posX, posY, posZ]);
			mat4.multiply(Tx, Tx, positionOfPillar);

			// bottom view
			//x, z
			moveToTx([-5, -10, -5], Tx);
			lineToTx([5, -10, -5], Tx);
			moveToTx([5,-10,-5], Tx);
			lineToTx([5,-10,5], Tx);
			moveToTx([5,-10,5], Tx);
			lineToTx([-5,-10,5], Tx);
			moveToTx([-5,-10,5], Tx);
			lineToTx([-5,-10,-5], Tx);

			// top view
			moveToTx([-5, 5, -5], Tx);
			lineToTx([5, 5, -5], Tx);
			moveToTx([5,5,-5], Tx);
			lineToTx([5,5,5], Tx);
			moveToTx([5,5,5], Tx);
			lineToTx([-5,5,5], Tx);
			moveToTx([-5,5,5], Tx);
			lineToTx([-5,5,-5], Tx);

			// 4 side lines
			moveToTx([-5, -10, -5], Tx);
			lineToTx([-5, 5, -5], Tx)

			moveToTx([5,-10,-5], Tx);
			lineToTx([5,5,-5], Tx);

			moveToTx([5,-10,5], Tx);
			lineToTx([5,5,5], Tx);

			moveToTx([-5,-10,5], Tx);
			lineToTx([-5,5,5], Tx);

			context.stroke();
		}

		function DrawAllVerticalPillars(Tx){
			
			for(let i = 0; i< pillarQueue.length; i++){
				var p = pillarQueue[i];
				if(p.posZ <= -40){
					pillarQueue.shift();
				}else{
					DrawVerticalPillar(p.color, Tx, p.posX, p.posY, p.posZ);
				}

			}

		}




		// Create ViewPort transform
		var Tviewport = mat4.create();
		mat4.fromTranslation(Tviewport,[270,300,0]);  // Move the center of the
													// "lookAt" transform (where
													// the camera points) to the
													// canvas coordinates (200,300)
		mat4.scale(Tviewport,Tviewport,[100,-100,1]); // Flip the Y-axis,
													// scale everything by 100x

		// Create projection transform
		// (orthographic for now)
		var Tprojection = mat4.create();
		//mat4.ortho(Tprojection,-10,10,-10,10,-1,1);
		mat4.perspective(Tprojection,Math.PI/5,1,-1000,1000); // Use for perspective teaser!

		// COMBINE VIEWPOINT * PROJECTION
		var tVP_PROJ = mat4.create();
		mat4.multiply(tVP_PROJ, Tviewport, Tprojection);

		// Look at transform
		var locCamera = vec3.create();
		var distCamera = 40.0;
		locCamera[0] = distCamera*Math.sin(viewAngle);
		locCamera[1] = 10;
		locCamera[2] = distCamera*Math.cos(viewAngle);
		var locTarget = vec3.fromValues(0,0,0); // Aim at the origin of the world coords
		var vecUp = vec3.fromValues(0,1,0);
		var TlookAt = mat4.create();
		mat4.lookAt(TlookAt, locCamera, locTarget, vecUp);
		
		// Controls
		if(keyD == true){
			degD += speedOfDegRotationLR;
			displacementLR += speedOfDisplacementLR;
			if(degD >=360){degD = 0;}

			mat4.fromTranslation(ballRotationTransform, [displacementLR, 0, 0]); // MOVE LEFT/ RIGHT!!!!! USING DISPLACEMENTLR
			//mat4.rotate(ballRotationTransform, ballRotationTransform, (-degD)*Math.PI/180, [0, 0, 1]);
			
		}else if(keyA == true){
			degD += speedOfDegRotationLR;
			displacementLR -= speedOfDisplacementLR;
			if(degD >=360){degD = 0;}
			mat4.fromTranslation(ballRotationTransform, [displacementLR, 0, 0]);
			//mat4.rotate(ballRotationTransform, ballRotationTransform, (degD)*Math.PI/180, [0, 0, 1]);
		}


		// Functions
		// Draw definitions

		function DrawSphere(){
			// Create transform t_VP_CAM that incorporates
			// Viewport and Camera transformations
			// var tVP_PROJ_CAM = mat4.create();
			// mat4.multiply(tVP_PROJ_CAM,tVP_PROJ,TlookAt);
			// drawTrajectory(0.0, 2.0, 100, CircleY, tVP_PROJ_CAM, "green");

			if(degOfForwardRotation <=-360){
				degOfForwardRotation = 0;
			}
			mat4.rotate(ballRotationTransform, ballRotationTransform, (degOfForwardRotation)*Math.PI/180, [1,0,0]);


			// Rotate along X axis
			var deg = 0;
			while(deg <= 360){
				var tVP_PROJ_CAM2 = mat4.create();
				mat4.multiply(tVP_PROJ_CAM2,tVP_PROJ, TlookAt);
				mat4.multiply(tVP_PROJ_CAM2, tVP_PROJ_CAM2, ballRotationTransform);
				mat4.rotate(tVP_PROJ_CAM2, tVP_PROJ_CAM2, deg*Math.PI/180, [1, 0, 0]);
				drawTrajectory(0.0, 2.0, 100, CircleY, tVP_PROJ_CAM2, "green");

				deg += degIntervals;
			}

			// Rotate along Y axis
			deg = 0;
			while(deg <= 360){
				var tVP_PROJ_CAM2 = mat4.create();
				mat4.multiply(tVP_PROJ_CAM2,tVP_PROJ, TlookAt);
				mat4.multiply(tVP_PROJ_CAM2, tVP_PROJ_CAM2, ballRotationTransform);
				mat4.rotate(tVP_PROJ_CAM2, tVP_PROJ_CAM2, deg*Math.PI/180, [0, 1, 0]);
				drawTrajectory(0.0, 2.0, 100, CircleX, tVP_PROJ_CAM2, "green");

				deg += degIntervals;
			}

			// Rotate along Z axis
			deg = 0;
			while(deg <= 360){
				var tVP_PROJ_CAM2 = mat4.create();
				mat4.multiply(tVP_PROJ_CAM2,tVP_PROJ, TlookAt);
				mat4.multiply(tVP_PROJ_CAM2, tVP_PROJ_CAM2, ballRotationTransform);
				mat4.rotate(tVP_PROJ_CAM2, tVP_PROJ_CAM2, deg*Math.PI/180, [0, 0, 1]);
				drawTrajectory(0.0, 2.0, 100, CircleX, tVP_PROJ_CAM2, "green");

				deg += degIntervals;
			}

		}

		// Draw
		DrawSphere();
		

		// draws runway
		var tVP_PROJ_CAM3 = mat4.create();
		mat4.multiply(tVP_PROJ_CAM3,tVP_PROJ, TlookAt);
		drawRunway("red", tVP_PROJ_CAM3);

		var tVP_PROJ_CAM4 = mat4.create();
		mat4.multiply(tVP_PROJ_CAM4,tVP_PROJ, TlookAt);
		//DrawVerticalPillar("black", tVP_PROJ_CAM4);
		DrawAllVerticalPillars(tVP_PROJ_CAM4);

	}

	

	// animators
	function sphereAnimator(){

		draw();
	}

	function pillarAnimator(){
		//posXPillar = Math.floor(Math.random() * (numberOfPillarPositions - 0) + 0);
		//posZPillar -= 3;

		for(let i=0; i< pillarQueue.length; i++){

			var p = pillarQueue[i];
			p.posZ -= displacementZPillar;
		}

		draw();
	}
    
    
	//event listener
	function onKeyDown(event) {
		var keyCode = event.keyCode;
		switch (keyCode) {
			case 68: //d

				keyD = true;
				break;

			case 83: //s

				keyS = true;
				break;

			case 65: //a

				keyA = true;
				break;

			case 87: //w

				keyW = true;
				break;
		}

		//console.log(keyD, keyS, keyA, keyW); // tester
		draw();
	}

	function onKeyUp(event) {
		var keyCode = event.keyCode;

		switch (keyCode) {
			case 68: //d

				keyD = false;
				break;

			case 83: //s

				keyS = false;
				break;

			case 65: //a

				keyA = false;
				break;

			case 87: //w

				keyW = false;
				break;
		}

		draw();
	
	}

	window.addEventListener("keydown", onKeyDown, false);
	window.addEventListener("keyup", onKeyUp, false);

	sliderX.addEventListener("input",draw);
    sliderY.addEventListener("input",draw);

	sphereAnimatorTracker = setInterval(sphereAnimator, speedOfSphereRender);
	pillarAnimatorTracker = setInterval(pillarAnimator, speedOfPillarRender);
	pillarGeneratorTracker = setInterval(pillarGenerator, speedOfPillarGenerator);
	

    draw();


}
window.onload = setup;


