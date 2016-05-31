var surface = {
    verts: new Float32Array ([
        2.5, 2.5,0.0,
        2.5, -2.5, 0.0,
        -2.5, -2.5, 0.0,
        -2.5, 2.5, 0.0
    ]),
    normals: new Float32Array ([
        0.0, 0.0, 1,
        0.0, 0.0, 1,
        0.0, 0.0, 1,
        0.0, 0.0, 1
    ]),
    texCoords: new Float32Array ([
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        0.0, 1.0
    ]),
    triangleStrip: new Uint16Array ([1, 2, 0, 3])
}