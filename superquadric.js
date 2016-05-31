var superquadric = {
    // slices and dices
    M: 64,
    N: 64,
    // bulge values
    n: 2,
    m: 2,
    
    verts: null,
    normals: null,
    texCoords: null,

    /* 
    create verts, normals, texture coordinates
    */
    createGeometry: function () {

        /*
        verts and normals
        */
        var N = this.N, M = this.M;
        var numFloats = 3 * (N + 1) * (M + 1);
        // -Pi/2 <= v, -Pi <= u
        var v = -Math.PI / 2;
        var u = -Math.PI;
        // change in v and u
        var dv = Math.PI / N;
        var du = 2 * Math.PI / M;
        if (!this.verts || this.verts.length != numFloats) {
            this.verts = new Float32Array(numFloats);
            this.normals = new Float32Array(numFloats);
            this.texCoords = new Float32Array(2 * (N + 1) * (M + 1));
        }
        var n = 0; // verts & normals index
        var m = 0; // tex coords index

        for (var i = 0; i <= N; i++) {
            u = -Math.PI; //go back to start of row
            for (var j = 0; j <= M; j++) {
                if (j == M) // handles wrap around
                    u = -Math.PI;
                // parametric of  superquadric
                this.verts[n] = Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), 2 / this.m - 1) * Math.cos(u) * Math.pow(Math.abs(Math.cos(u)), 2 / this.n - 1);
                this.verts[n + 1] = Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), 2 / this.m - 1) * Math.sin(u) * Math.pow(Math.abs(Math.sin(u)), 2 / this.n - 1);
                this.verts[n + 2] = Math.sin(v) * Math.pow(Math.abs(Math.sin(v)), 2 / this.m - 1);
                // normals of superquadric
                this.normals[n] = Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), 2 - 2 /this.m - 1) * Math.cos(u) * Math.pow(Math.abs(Math.cos(u)), 2 - 2 / this.n - 1);
                this.normals[n + 1] = Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), 2 - 2 / this.m - 1) * Math.sin(u) * Math.pow(Math.abs(Math.sin(u)), 2 - 2 / this.n - 1);
                this.normals[n + 2] = Math.sin(v) * Math.pow(Math.abs(Math.sin(v)), 2 - 2 / this.m - 1);
                u += du; // increment distance for strip(left to right)
                n += 3; // increment verts and normals array
            }
            v += dv; // increment distance for strip(bottom to top)
        }

        /*
        texturing
        */

        // set indices
        var n = 3 * (M + 1) + 3;
        var m = 2 * (M + 1) + 2; 
      
        // sij
        // i = 1,...,N
        for (var i = 1; i < N; i++) {
            var d = new Float32Array(M + 1); //dik
            
            // j = 1,...,M
            // calculate Euclidean distance ( dij = ||Pij - Pij-1|| )
            for (var j = 1; j <= M; j++) { 
                var Px = this.verts[n] - this.verts[n - 3];
                var Py = this.verts[n + 1] - this.verts[n - 2];
                var Pz = this.verts[n + 2] - this.verts[n - 1];
                d[j] = Math.sqrt(Math.pow(Px,2) + Math.pow(Py,2) + Math.pow(Pz,2));
                n += 3; //increment
            }
     
            // calculate sij
            for (var j = 1; j <= M; j++) {
                var dSummation1 = 0; //dik summation (k=1 ...j)
                var dSummation2 = 0; //dik summation (k=1 ... M) 
                // calculate summations
                for (var k = 1; k <= j; k++) {
                    dSummation1 += d[k];
                }
                for (var k = 1; k <= M; k++) {
                    dSummation2 += d[k];
                }

                //sij
                var s = dSummation1 / dSummation2;
                this.texCoords[m] = s;
                m += 2;
            }
            //increment indices
            n += 3;
            m += 2;
        }

        //tij
        for (var j = 0; j < M; j++) {
            var d = new Float32Array(N + 1);
            
            // tij = ||Pji - Pji-1||, j = 1...M
            for (var i = 1; i <= N; i++) {
                // calculate Euclidean distance 
                var Px = this.verts[(3 * i * (M + 1)) + (3 * j)] - this.verts[(3 * (i - 1) * (M + 1)) + (3 * j)];
                var Py = this.verts[(3 * i * (M + 1)) + (3 * j + 1)] - this.verts[(3 * (i - 1) * (M + 1)) + (3 * j + 1)];
                var Pz = this.verts[(3 * i * (M + 1)) + (3 * j + 2)] - this.verts[(3 * (i - 1) * (M + 1)) + (3 * j + 2)];
                d[i] = Math.sqrt(Math.pow(Px,2) + Math.pow(Py,2) + Math.pow(Pz,2));
            }

            //tij calculation
            for (var i = 1; i <= N; i++) {
                var dSummation1 = 0;
                var dSummation2 = 0;
                //calculate summations
                for (var k = 1; k <= i; k++) {
                    dSummation1 += d[k];
                }
                for (var k = 1; k <= N; k++) {
                    dSummation2 += d[k];
                }
                this.texCoords[2 * i * (M + 1) + (2 * j) + 1] = dSummation1 / dSummation2;
            }
        }

        // s values special case
        for (var j = 0; j <= M; j++) {
            //soj = s1j
            this.texCoords[2 * j] = this.texCoords[(2 * (M + 1)) + (2 * j)];
            //sNj = SN-1j
            this.texCoords[2 * N * (M + 1) + (2 * j)] = this.texCoords[2 * (N - 1) * (M + 1) + (2 * j)];
        }

        // t values special case 
        for (var i = 0; i <= N; i++) {
            // tiM = ti0
            this.texCoords[(2 * i * (M + 1) + 1) + (2 * M)] = this.texCoords[(2 * i * (M + 1) + 1)];
        }
    },

    // create triangle strips
    triangleStrip: null,

    createTriangleStrip: function () {
        var M = this.M, N = this.N;
        var numIndices = N * (2 * (M + 1) + 2) - 2;
        if (!this.triangleStrip || this.triangleStrip.length != numIndices) {
            this.triangleStrip = new Uint16Array(numIndices);
        }
        var index = function (i, j) {
            return i * (M + 1) + j;
        }
        var n = 0;
        for (var i = 0; i < N; i++) {
            if (i > 0) {      
                this.triangleStrip[n++] = index(i, 0);
            }
            for (var j = 0; j <= M; j++) {
                this.triangleStrip[n++] = index(i, j);
                this.triangleStrip[n++] = index(i + 1, j);
            }
            if (i < N - 1) {
                this.triangleStrip[n++] = index(i, M);
            }
        }
    }
}