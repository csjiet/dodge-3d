function setup() {

	// Canvas variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

	// Slider variables
    var sliderX = document.getElementById('sliderX');
    sliderX.value = 0;
    var sliderY = document.getElementById('sliderY');
    sliderY.value = 0;

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
			var result = [10.0*Math.cos(2.0*Math.PI*t),0,10.0*Math.sin(2.0*Math.PI*t)];
			// var l = t// longitude
			// var c = t// colatitude
			// var result = [10.0*Math.cos(l)*Math.sin(c/2), 10.0*Math.sin(l)*Math.sin(c/2), 10.0*Math.cos(c/2)];
			return result;
		}

		function CircleX(t){
			//var result = [10.0*Math.cos(2.0*Math.PI*t),8.0*t,10.0*Math.sin(2.0*Math.PI*t)];
			var result = [0, 10.0*Math.cos(2.0*Math.PI*t),10.0*Math.sin(2.0*Math.PI*t)];
			return result;
		}

		function CircleZ(t){
			//var result = [10.0*Math.cos(2.0*Math.PI*t),8.0*t,10.0*Math.sin(2.0*Math.PI*t)];
			var result = [10.0*Math.cos(2.0*Math.PI*t),10.0*Math.sin(2.0*Math.PI*t,0)];
			return result;
		}

		function drawRunway(color, Tx){
			context.beginPath();
	    	context.strokeStyle = color;

			// drawn on x, z plane
			moveToTx([30, 0, 0], Tx);
			lineToTx([30, 0, 90], Tx)

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




		// Create ViewPort transform
		var Tviewport = mat4.create();
		mat4.fromTranslation(Tviewport,[200,300,0]);  // Move the center of the
													// "lookAt" transform (where
													// the camera points) to the
													// canvas coordinates (200,300)
		mat4.scale(Tviewport,Tviewport,[100,-100,1]); // Flip the Y-axis,
													// scale everything by 100x

		// Create projection transform
		// (orthographic for now)
		var Tprojection = mat4.create();
		//mat4.ortho(Tprojection,-10,10,-10,10,-1,1);
		mat4.perspective(Tprojection,Math.PI/5,1,-1,1); // Use for perspective teaser!

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
		
		
		function drawSphere(degIntervals){
			// Create transform t_VP_CAM that incorporates
			// Viewport and Camera transformations
			// var tVP_PROJ_CAM = mat4.create();
			// mat4.multiply(tVP_PROJ_CAM,tVP_PROJ,TlookAt);
			// drawTrajectory(0.0, 2.0, 100, CircleY, tVP_PROJ_CAM, "green");


			// Rotate along X axis
			var deg = 0;
			while(deg <= 360){
				var tVP_PROJ_CAM2 = mat4.create();
				mat4.multiply(tVP_PROJ_CAM2,tVP_PROJ, TlookAt);
				mat4.rotate(tVP_PROJ_CAM2, tVP_PROJ_CAM2, deg*Math.PI/180, [1, 0, 0]);
				drawTrajectory(0.0, 2.0, 100, CircleY, tVP_PROJ_CAM2, "green");

				deg += degIntervals;
			}

			// Rotate along Y axis
			deg = 0;
			while(deg <= 360){
				var tVP_PROJ_CAM2 = mat4.create();
				mat4.multiply(tVP_PROJ_CAM2,tVP_PROJ, TlookAt);
				mat4.rotate(tVP_PROJ_CAM2, tVP_PROJ_CAM2, deg*Math.PI/180, [0, 1, 0]);
				drawTrajectory(0.0, 2.0, 100, CircleX, tVP_PROJ_CAM2, "green");

				deg += degIntervals;
			}

			// Rotate along Z axis
			deg = 0;
			while(deg <= 360){
				var tVP_PROJ_CAM2 = mat4.create();
				mat4.multiply(tVP_PROJ_CAM2,tVP_PROJ, TlookAt);
				mat4.rotate(tVP_PROJ_CAM2, tVP_PROJ_CAM2, deg*Math.PI/180, [0, 0, 1]);
				drawTrajectory(0.0, 2.0, 100, CircleX, tVP_PROJ_CAM2, "green");

				deg += degIntervals;
			}

		}

		drawSphere(15);

		var tVP_PROJ_CAM3 = mat4.create();
		mat4.multiply(tVP_PROJ_CAM3,tVP_PROJ, TlookAt);
		drawRunway("red", tVP_PROJ_CAM3);

	}
    
    sliderX.addEventListener("input",draw);
    sliderY.addEventListener("input",draw);
    draw();
}
window.onload = setup;


