// 놀이 탭 퍼즐 이미지 정적 에셋 레지스트리.
//
// RN(Metro)은 동적 경로의 require() 를 지원하지 않기 때문에, 서버가 내려주는
// asset_key 문자열(habit_puzzle_set.asset_key)을 이 표에서 찾아 실제 이미지 모듈로 바꿔써야 한다.
//
// 세트를 새로 추가하려면:
//   1) assets/puzzles/<asset_key>.png (전체 이미지), assets/puzzles/<asset_key>/piece_00~15.png (조각) 추가
//   2) 아래 PUZZLE_COVERS, PUZZLE_PIECES 에 항목 추가
//   3) 백엔드 habit_puzzle_set 시드에도 같은 asset_key 로 세트를 추가
import manifest from '../../assets/puzzles/pieces_manifest.json';

export interface PuzzlePieceLayout {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PuzzleManifest {
  canvasSize: number;
  rows: number;
  cols: number;
  pieces: PuzzlePieceLayout[];
}

// 조각 모양·위치는 6세트 전부 동일한 시드로 생성돼서 매니페스트 하나를 공유한다.
export const PUZZLE_MANIFEST: PuzzleManifest = manifest as PuzzleManifest;

// 세트 전체 이미지 (완성 미리보기, 갤러리 썸네일용)
export const PUZZLE_COVERS: Record<string, ReturnType<typeof require>> = {
  spring_blossom: require('../../assets/puzzles/spring_blossom.png'),
  summer_beach: require('../../assets/puzzles/summer_beach.png'),
  autumn_picnic: require('../../assets/puzzles/autumn_picnic.png'),
  winter_christmas: require('../../assets/puzzles/winter_christmas.png'),
  classroom: require('../../assets/puzzles/classroom.png'),
  cozy_room: require('../../assets/puzzles/cozy_room.png'),
};

// 세트별 16개 직소 조각 이미지 (manifest.pieces[i] 와 같은 순서)
export const PUZZLE_PIECES: Record<string, ReturnType<typeof require>[]> = {
  spring_blossom: [
    require('../../assets/puzzles/spring_blossom/piece_00.png'),
    require('../../assets/puzzles/spring_blossom/piece_01.png'),
    require('../../assets/puzzles/spring_blossom/piece_02.png'),
    require('../../assets/puzzles/spring_blossom/piece_03.png'),
    require('../../assets/puzzles/spring_blossom/piece_04.png'),
    require('../../assets/puzzles/spring_blossom/piece_05.png'),
    require('../../assets/puzzles/spring_blossom/piece_06.png'),
    require('../../assets/puzzles/spring_blossom/piece_07.png'),
    require('../../assets/puzzles/spring_blossom/piece_08.png'),
    require('../../assets/puzzles/spring_blossom/piece_09.png'),
    require('../../assets/puzzles/spring_blossom/piece_10.png'),
    require('../../assets/puzzles/spring_blossom/piece_11.png'),
    require('../../assets/puzzles/spring_blossom/piece_12.png'),
    require('../../assets/puzzles/spring_blossom/piece_13.png'),
    require('../../assets/puzzles/spring_blossom/piece_14.png'),
    require('../../assets/puzzles/spring_blossom/piece_15.png'),
  ],
  summer_beach: [
    require('../../assets/puzzles/summer_beach/piece_00.png'),
    require('../../assets/puzzles/summer_beach/piece_01.png'),
    require('../../assets/puzzles/summer_beach/piece_02.png'),
    require('../../assets/puzzles/summer_beach/piece_03.png'),
    require('../../assets/puzzles/summer_beach/piece_04.png'),
    require('../../assets/puzzles/summer_beach/piece_05.png'),
    require('../../assets/puzzles/summer_beach/piece_06.png'),
    require('../../assets/puzzles/summer_beach/piece_07.png'),
    require('../../assets/puzzles/summer_beach/piece_08.png'),
    require('../../assets/puzzles/summer_beach/piece_09.png'),
    require('../../assets/puzzles/summer_beach/piece_10.png'),
    require('../../assets/puzzles/summer_beach/piece_11.png'),
    require('../../assets/puzzles/summer_beach/piece_12.png'),
    require('../../assets/puzzles/summer_beach/piece_13.png'),
    require('../../assets/puzzles/summer_beach/piece_14.png'),
    require('../../assets/puzzles/summer_beach/piece_15.png'),
  ],
  autumn_picnic: [
    require('../../assets/puzzles/autumn_picnic/piece_00.png'),
    require('../../assets/puzzles/autumn_picnic/piece_01.png'),
    require('../../assets/puzzles/autumn_picnic/piece_02.png'),
    require('../../assets/puzzles/autumn_picnic/piece_03.png'),
    require('../../assets/puzzles/autumn_picnic/piece_04.png'),
    require('../../assets/puzzles/autumn_picnic/piece_05.png'),
    require('../../assets/puzzles/autumn_picnic/piece_06.png'),
    require('../../assets/puzzles/autumn_picnic/piece_07.png'),
    require('../../assets/puzzles/autumn_picnic/piece_08.png'),
    require('../../assets/puzzles/autumn_picnic/piece_09.png'),
    require('../../assets/puzzles/autumn_picnic/piece_10.png'),
    require('../../assets/puzzles/autumn_picnic/piece_11.png'),
    require('../../assets/puzzles/autumn_picnic/piece_12.png'),
    require('../../assets/puzzles/autumn_picnic/piece_13.png'),
    require('../../assets/puzzles/autumn_picnic/piece_14.png'),
    require('../../assets/puzzles/autumn_picnic/piece_15.png'),
  ],
  winter_christmas: [
    require('../../assets/puzzles/winter_christmas/piece_00.png'),
    require('../../assets/puzzles/winter_christmas/piece_01.png'),
    require('../../assets/puzzles/winter_christmas/piece_02.png'),
    require('../../assets/puzzles/winter_christmas/piece_03.png'),
    require('../../assets/puzzles/winter_christmas/piece_04.png'),
    require('../../assets/puzzles/winter_christmas/piece_05.png'),
    require('../../assets/puzzles/winter_christmas/piece_06.png'),
    require('../../assets/puzzles/winter_christmas/piece_07.png'),
    require('../../assets/puzzles/winter_christmas/piece_08.png'),
    require('../../assets/puzzles/winter_christmas/piece_09.png'),
    require('../../assets/puzzles/winter_christmas/piece_10.png'),
    require('../../assets/puzzles/winter_christmas/piece_11.png'),
    require('../../assets/puzzles/winter_christmas/piece_12.png'),
    require('../../assets/puzzles/winter_christmas/piece_13.png'),
    require('../../assets/puzzles/winter_christmas/piece_14.png'),
    require('../../assets/puzzles/winter_christmas/piece_15.png'),
  ],
  classroom: [
    require('../../assets/puzzles/classroom/piece_00.png'),
    require('../../assets/puzzles/classroom/piece_01.png'),
    require('../../assets/puzzles/classroom/piece_02.png'),
    require('../../assets/puzzles/classroom/piece_03.png'),
    require('../../assets/puzzles/classroom/piece_04.png'),
    require('../../assets/puzzles/classroom/piece_05.png'),
    require('../../assets/puzzles/classroom/piece_06.png'),
    require('../../assets/puzzles/classroom/piece_07.png'),
    require('../../assets/puzzles/classroom/piece_08.png'),
    require('../../assets/puzzles/classroom/piece_09.png'),
    require('../../assets/puzzles/classroom/piece_10.png'),
    require('../../assets/puzzles/classroom/piece_11.png'),
    require('../../assets/puzzles/classroom/piece_12.png'),
    require('../../assets/puzzles/classroom/piece_13.png'),
    require('../../assets/puzzles/classroom/piece_14.png'),
    require('../../assets/puzzles/classroom/piece_15.png'),
  ],
  cozy_room: [
    require('../../assets/puzzles/cozy_room/piece_00.png'),
    require('../../assets/puzzles/cozy_room/piece_01.png'),
    require('../../assets/puzzles/cozy_room/piece_02.png'),
    require('../../assets/puzzles/cozy_room/piece_03.png'),
    require('../../assets/puzzles/cozy_room/piece_04.png'),
    require('../../assets/puzzles/cozy_room/piece_05.png'),
    require('../../assets/puzzles/cozy_room/piece_06.png'),
    require('../../assets/puzzles/cozy_room/piece_07.png'),
    require('../../assets/puzzles/cozy_room/piece_08.png'),
    require('../../assets/puzzles/cozy_room/piece_09.png'),
    require('../../assets/puzzles/cozy_room/piece_10.png'),
    require('../../assets/puzzles/cozy_room/piece_11.png'),
    require('../../assets/puzzles/cozy_room/piece_12.png'),
    require('../../assets/puzzles/cozy_room/piece_13.png'),
    require('../../assets/puzzles/cozy_room/piece_14.png'),
    require('../../assets/puzzles/cozy_room/piece_15.png'),
  ],
};

