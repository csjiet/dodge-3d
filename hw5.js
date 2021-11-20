function setup() {

	// Canvas variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

	// Slider variables
    //var sliderX = document.getElementById('sliderX');
    //sliderX.value = 50;
    var sliderY = document.getElementById('sliderY');
    sliderY.value = 50;

	var recenterButton = document.getElementById('recenterButton');

	var gameStart = false;

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
	var speedOfPillarRender = 3000;
	var speedOfPillarGenerator = 3000;
	var displacementOfPillar = 3;
	var pillarQueue = [];


	// runway variables
	var widthOfRunWay = 27;

	// score variables
	var lives = 5;

	class Pillar{
		constructor(posX, posY, posZ, color, generateStatus){
			this.posX = posX;
			this.posY = posY;
			this.posZ = posZ;
			this.color = color;
			this.generateStatus = generateStatus;
		}
	}

	var x1 = 0;
	var y1 = 0;
	var x2 = 0;
	var y2 = 0;
	var x3 = 0;
	var y3 = 0;

	// Functions
	// PillarGenerator
	function pillarGenerator(){
		
		var spawnPosX = Math.floor(Math.random() * (30 - (-30)) + (-30));
		let p = new Pillar(spawnPosX, 0, 250, "black", false);
		pillarQueue.push(p);
		
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

		function collisionDetection(){

			for(let i = 0; i< pillarQueue.length; i++){
				if(pillarQueue[i].posX - 5 <= displacementLR + 8 && (pillarQueue[i].posX + 5 >= displacementLR - 8)|| pillarQueue[i].posX + 5 >= displacementLR - 8 && (pillarQueue[i].posX - 5 <= displacementLR + 8)){
					if(pillarQueue[i].posZ - 5 <= 0 + 8 && (pillarQueue[i].posZ + 5 >= 0 - 8)|| pillarQueue[i].posZ + 5 >= 0 - 8 && (pillarQueue[i].posZ - 5 <= 0 + 8)){
						context.font = "60px Arial";
						context.fillStyle = "red";
						context.textAlign = "center";
						context.fillText("-1", 40, 50);
					}
					// if(pillarQueue[i].posZ <= 0 + 8 && (pillarQueue[i].posZ >= 0 - 8)|| pillarQueue[i].posZ >= 0 - 8 && (pillarQueue[i].posZ <= 0 + 8)){
					// 	lives = lives - 1;
					// }
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
		mat4.perspective(Tprojection,Math.PI/5,1,-40,1000); // Use for perspective teaser!

		// COMBINE VIEWPOINT * PROJECTION
		var tVP_PROJ = mat4.create();
		mat4.multiply(tVP_PROJ, Tviewport, Tprojection);

		// Look at transform
		var locCamera = vec3.create();
		var distCamera = 40.0;
		locCamera[0] = distCamera*Math.sin(viewAngle);
		locCamera[1] = 10;
		locCamera[2] = distCamera*Math.cos(viewAngle);



		var locTarget = vec3.fromValues(0, 0, 0); // Aim at the origin of the world coords
		var vecUp = vec3.fromValues(0,1,0);
		var TlookAt = mat4.create();
		mat4.lookAt(TlookAt, locCamera, locTarget, vecUp);
		
		// Controls
		if(keyD == true){
			gameStart = true;
			degD += speedOfDegRotationLR;
			displacementLR += speedOfDisplacementLR;
			
			if(degD >=360){degD = 0;}

			
			mat4.fromTranslation(ballRotationTransform, [displacementLR, 0, 0]); 


			context.save();
			context.translate(350, 400);
			context.font = "40px Arial";
			context.fillStyle = "red";
			context.textAlign = "center";
			context.fillText(">>>", 40, 50);
			context.restore();
			
			//mat4.rotate(ballRotationTransform, ballRotationTransform, (-degD)*Math.PI/180, [0, 0, 1]);
			
		}else if(keyA == true){
			gameStart = true;
			degD += speedOfDegRotationLR;
			displacementLR -= speedOfDisplacementLR;
		
			if(degD >=360){degD = 0;}

			mat4.fromTranslation(ballRotationTransform, [displacementLR, 0, 0]);

			context.save();
			context.translate(99, 400);
			context.font = "40px Arial";
			context.fillStyle = "red";
			context.textAlign = "center";
			context.fillText("<<<", 40, 50);
			context.restore();
			
			//mat4.rotate(ballRotationTransform, ballRotationTransform, (degD)*Math.PI/180, [0, 0, 1]);
		}


		// Functions
		// Draw definitions
		function DrawArrow(color, Tx){
			context.beginPath();
	    	context.fillStyle = color;

			let t = Tx;
			let arrowPoint = -5;
			let rangeToTheCamera = -20;
			let arrowWing = 5;
			let lengthOfArrow = 5;
			let arrowDiptoBody = 3;
			moveToTx([arrowPoint, 0, rangeToTheCamera], t);
			lineToTx([0, arrowWing, rangeToTheCamera], t);
			moveToTx([0, arrowWing, rangeToTheCamera], t);
			lineToTx([0, arrowWing - arrowDiptoBody, rangeToTheCamera], t);
			moveToTx([0, arrowWing - arrowDiptoBody, rangeToTheCamera], t);
			lineToTx([0 + lengthOfArrow, arrowWing - arrowDiptoBody, rangeToTheCamera], t);
			moveToTx([0 + lengthOfArrow, arrowWing - arrowDiptoBody, rangeToTheCamera], t);
			lineToTx([0 + lengthOfArrow, 0, rangeToTheCamera], t);

			moveToTx([arrowPoint, 0, rangeToTheCamera], t);
			lineToTx([0, -arrowWing, rangeToTheCamera], t);
			moveToTx([0, -arrowWing, rangeToTheCamera], t);
			lineToTx([0, -arrowWing + arrowDiptoBody, rangeToTheCamera], t);
			moveToTx([0, -arrowWing + arrowDiptoBody, rangeToTheCamera], t);
			lineToTx([0 + lengthOfArrow, -arrowWing + arrowDiptoBody, rangeToTheCamera], t);
			moveToTx([0 + lengthOfArrow, -arrowWing + arrowDiptoBody, rangeToTheCamera], t);
			lineToTx([0 + lengthOfArrow, 0, rangeToTheCamera], t);

			context.closePath();
			context.fill();
			context.stroke();
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
			moveToTx([widthOfRunWay, elevation, 300], Tx);
			lineToTx([-widthOfRunWay, elevation, 300], Tx)

			moveToTx([widthOfRunWay, elevation, -30], Tx);
			lineToTx([-widthOfRunWay, elevation, -30], Tx)

			// end pillar
			moveToTx([widthOfRunWay, elevation, 300], Tx);
			lineToTx([widthOfRunWay, elevation + 1000, 300], Tx)

			moveToTx([-widthOfRunWay, elevation, 300], Tx);
			lineToTx([-widthOfRunWay, elevation + 1000, 300], Tx)

			// Runway to the end
			// moveToTx([widthOfRunWay, elevation, 30], Tx);
			// lineToTx([widthOfRunWay, elevation, 50], Tx);
			var endZDistance = 300;
			var currentZDistance = 30;
			for(let i = 0; currentZDistance <= endZDistance; i++){
				moveToTx([widthOfRunWay, elevation, currentZDistance], Tx);
				currentZDistance += 20;
				lineToTx([widthOfRunWay, elevation, currentZDistance], Tx)
			}

			var endZDistance = 300;
			var currentZDistance = 30;
			for(let i = 0; currentZDistance <= endZDistance; i++){
				moveToTx([-widthOfRunWay, elevation, currentZDistance], Tx);
				currentZDistance += 20;
				lineToTx([-widthOfRunWay, elevation, currentZDistance], Tx)
			}
			
			

			context.stroke();
		}

		function DrawVerticalPillar(color, Tx, posX, posY, posZ){
			context.beginPath();
	    	context.strokeStyle = color;

			let tempTx = mat4.clone(Tx);

			let positionOfPillar = mat4.create();
			//mat4.fromTranslation(positionOfPillar, [arrayOfPillarXDisplacements[posXPillar], 0, posZPillar]);
			mat4.fromTranslation(positionOfPillar, [posX, posY, posZ]);
			mat4.multiply(tempTx, Tx, positionOfPillar);

			// bottom view
			//x, z
			moveToTx([-5, -10, -5], tempTx);
			lineToTx([5, -10, -5], tempTx);
			moveToTx([5,-10,-5], tempTx);
			lineToTx([5,-10,5], tempTx);
			moveToTx([5,-10,5], tempTx);
			lineToTx([-5,-10,5], tempTx);
			moveToTx([-5,-10,5], tempTx);
			lineToTx([-5,-10,-5], tempTx);

			// top view
			moveToTx([-5, 5, -5], tempTx);
			lineToTx([5, 5, -5], tempTx);
			moveToTx([5,5,-5], tempTx);
			lineToTx([5,5,5], tempTx);
			moveToTx([5,5,5], tempTx);
			lineToTx([-5,5,5], tempTx);
			moveToTx([-5,5,5], tempTx);
			lineToTx([-5,5,-5], tempTx);

			// 4 side lines
			moveToTx([-5, -10, -5], tempTx);
			lineToTx([-5, 5, -5], tempTx)

			moveToTx([5,-10,-5], tempTx);
			lineToTx([5,5,-5], tempTx);

			moveToTx([5,-10,5], tempTx);
			lineToTx([5,5,5], tempTx);

			moveToTx([-5,-10,5], tempTx);
			lineToTx([-5,5,5], tempTx);

			context.stroke();

		}

		function DrawAllVerticalPillars(){
			let tVP_PROJ_CAM4 = mat4.create();
			mat4.multiply(tVP_PROJ_CAM4, tVP_PROJ, TlookAt);


			for(let i=0; i< pillarQueue.length; i++){
				let p = pillarQueue[i];
				p.posZ -= displacementOfPillar;
				
				if(p.posZ <= -15){
					pillarQueue.shift();
				}else{
					DrawVerticalPillar("black", tVP_PROJ_CAM4, p.posX, p.posY, p.posZ);
				}
				
			}

		}

		function DrawSphere(){
			// Create transform t_VP_CAM that incorporates
			// Viewport and Camera transformations
			// var tVP_PROJ_CAM = mat4.create();
			// mat4.multiply(tVP_PROJ_CAM,tVP_PROJ,TlookAt);
			// drawTrajectory(0.0, 2.0, 100, CircleY, tVP_PROJ_CAM, "green");

			if(degOfForwardRotation <=-360){
				degOfForwardRotation = 0;
			}
			
			if(gameStart == true){
				mat4.rotate(ballRotationTransform, ballRotationTransform, (degOfForwardRotation)*Math.PI/180, [1,0,0]);
			}

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

		function DrawLoadingScreen(){
			context.save();
			context.translate(240, 150);
			context.font = "40px Arial";
			context.fillStyle = "red";
			context.textAlign = "center";
			context.fillText("Press any button to start", 40, 50);
			context.restore();
		}

		// Draw
		if(gameStart == false){
			DrawLoadingScreen();
		}

		DrawSphere();
		// draws runway
		var tVP_PROJ_CAM3 = mat4.create();
		mat4.multiply(tVP_PROJ_CAM3,tVP_PROJ, TlookAt);
		drawRunway("red", tVP_PROJ_CAM3);

		var tVP_PROJ_CAM4 = mat4.create();
		mat4.multiply(tVP_PROJ_CAM4, tVP_PROJ, TlookAt);
		DrawVerticalPillar("black", tVP_PROJ_CAM4, 0, 0, 250);
		DrawAllVerticalPillars();

		
		var tVP_PROJ_CAM5 = mat4.create();
		var arrowTranslationToLeft = mat4.create();
		mat4.fromTranslation(arrowTranslationToLeft, [-10, -5, 0]);
		mat4.multiply(tVP_PROJ_CAM5, tVP_PROJ, TlookAt);
		mat4.multiply(tVP_PROJ_CAM5, tVP_PROJ_CAM5, arrowTranslationToLeft);
		DrawArrow("red", tVP_PROJ_CAM5);
	
	
		var tVP_PROJ_CAM6 = mat4.create();
		var arrowTranslationToLeft = mat4.create();
		mat4.fromTranslation(arrowTranslationToLeft, [-10, -5, 0]);
		var flipTranslationToRight = mat4.create();
		mat4.scale(flipTranslationToRight, flipTranslationToRight, [-1, 1, 1]);
		mat4.multiply(flipTranslationToRight, flipTranslationToRight, arrowTranslationToLeft);
		mat4.multiply(tVP_PROJ_CAM6, tVP_PROJ, TlookAt);
		mat4.multiply(tVP_PROJ_CAM6, tVP_PROJ_CAM6, flipTranslationToRight);
		DrawArrow("red", tVP_PROJ_CAM6);
		
		collisionDetection();

	}

	

	// animators
	function sphereAnimator(){
		draw();
		
	}

	function pillarAnimator(){
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

	function recenterCamera(){
		sliderY.value = 50;
	}

	window.addEventListener("keydown", onKeyDown, false);
	window.addEventListener("keyup", onKeyUp, false);

	//sliderX.addEventListener("input",draw);
    sliderY.addEventListener("input",draw);

	recenterButton.addEventListener("click", recenterCamera);

	sphereAnimatorTracker = setInterval(sphereAnimator, speedOfSphereRender);
	pillarAnimatorTracker = setInterval(pillarAnimator, speedOfPillarRender);
	pillarGeneratorTracker = setInterval(pillarGenerator, speedOfPillarGenerator);
	

    draw();


}
window.onload = setup;


