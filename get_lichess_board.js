const maxApi = require('max-api');
const https = require('https');

// returns an array of 1s and 0s for the given pieces from the given fen string
function get_pieces_from_fen(fen, piece) {
    let board_fen = fen.split(" ")[0];
    let column = 0;
    let row = 0;
    let result = [];
    for (const char of board_fen) {
        if ((0 <= char) && (char <= 9)) {
            for (let i = 0; i < char; i++) {
                result.push(column);
                column = (column + 1) % 8
                result.push(row);
                result.push(0);
            }
            
        } else if (char === piece) {
            result.push(column);
            column = (column + 1) % 8
            result.push(row);
            result.push(1);
        } else if (char === '/') {
            row = (row + 1) % 8
            //continue;
        } else if (char === ' ') {
            return result;
        } else {
            result.push(column);
            column = (column + 1) % 8;
            result.push(row);
            result.push(0);
        }
    }
    return result;
}

function get_color_from_fen(fen) {
    //TODO: check function
    let color_code = fen.split(' ')[1];
    return color_code;
}

// The message 'stream_game' starts a new stream for the given game_id.
// Currently there is no way to end ongoing streams.
// Multiple games can be streamed in parallel. 
maxApi.addHandler('stream_game', (game_id) => {
    https.get('https://lichess.org/api/stream/game/' + game_id, (resp) => {
        let data = '';
    
        resp.on('data', (chunk) => {
            let string = chunk.toString('ascii').trim();
            let split = string.split('\n').map(x=>x.trim());
            for (part in split) {
                if (split[part].length > 2) {
                    let json = JSON.parse(split[part]);
                    let board_fen = json['fen'];
                    let last_move = json['lm'];
                    // console.log("fen: " + board_fen);
                    // console.log("lm: " + last_move);
                    let P_array = get_pieces_from_fen(board_fen, 'P').toString().replace(/,/g, ' ');
                    let N_array = get_pieces_from_fen(board_fen, 'N').toString().replace(/,/g, ' ');
                    let R_array = get_pieces_from_fen(board_fen, 'R').toString().replace(/,/g, ' ');
                    let B_array = get_pieces_from_fen(board_fen, 'B').toString().replace(/,/g, ' ');
                    let K_array = get_pieces_from_fen(board_fen, 'K').toString().replace(/,/g, ' ');
                    let Q_array = get_pieces_from_fen(board_fen, 'Q').toString().replace(/,/g, ' ');
                    let p_array = get_pieces_from_fen(board_fen, 'p').toString().replace(/,/g, ' ');
                    let r_array = get_pieces_from_fen(board_fen, 'r').toString().replace(/,/g, ' ');
                    let n_array = get_pieces_from_fen(board_fen, 'n').toString().replace(/,/g, ' ');
                    let b_array = get_pieces_from_fen(board_fen, 'b').toString().replace(/,/g, ' ');
                    let k_array = get_pieces_from_fen(board_fen, 'k').toString().replace(/,/g, ' ');
                    let q_array = get_pieces_from_fen(board_fen, 'q').toString().replace(/,/g, ' ');

                    let color = get_color_from_fen(board_fen);
                    // console.log(board_fen);
                    // console.log(P_array);
                    // maxApi.outlet(P_array);
                    maxApi.outlet('P '+P_array);
                    maxApi.outlet('R '+R_array);
                    maxApi.outlet('N '+N_array);
                    maxApi.outlet('B '+B_array);
                    maxApi.outlet('K '+K_array);
                    maxApi.outlet('Q '+Q_array);
                    maxApi.outlet('p '+p_array);
                    maxApi.outlet('r '+r_array);
                    maxApi.outlet('n '+n_array);
                    maxApi.outlet('b '+b_array);
                    maxApi.outlet('k '+k_array);
                    maxApi.outlet('q '+q_array);
                    maxApi.outlet('fen ' + json['fen']);
                    maxApi.outlet('color '+color);
                }
            }
        });
    
        resp.on('end', () => {
            maxApi.post('---transmission ended---')
        });
    
        resp.on('error', (err) => {
            maxApi.post('Error: ' + err.message);
            console.error('Error: ' + err.message)
        });
    });
})