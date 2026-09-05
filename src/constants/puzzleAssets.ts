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


// 조각의 홈(오목한) 부분 그림자는 별도의 반투명 오버레이 이미지로 분리해뒀다.
// 이유: 조각 그림 자체에 그림자를 구워 넣으면, 그 홈을 채우는 이웃 조각을 이미 모은
// 경우에도(즉 실제로는 이어붙어서 틈이 없는데도) 그림자가 그대로 남아 이음새가
// 어색하게 보인다. 그래서 그림자는 오른쪽/아래쪽 방향별로 따로 갖고 있다가,
// PuzzleBoard 에서 "그 방향 이웃 조각을 아직 못 모았을 때"만 위에 겹쳐 그린다
// (왼쪽/위쪽은 항상 먼저 모아진 조각이라 그림자가 필요 없어서 애초에 만들지 않는다).
export interface PuzzlePieceShadowSet {
  right: ReturnType<typeof require>;
  bottom: ReturnType<typeof require>;
}

export const PUZZLE_PIECE_SHADOWS: Record<string, PuzzlePieceShadowSet[]> = {
  spring_blossom: [
    { right: require('../../assets/puzzles/spring_blossom/piece_00_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_00_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_01_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_01_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_02_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_02_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_03_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_03_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_04_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_04_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_05_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_05_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_06_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_06_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_07_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_07_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_08_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_08_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_09_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_09_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_10_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_10_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_11_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_11_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_12_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_12_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_13_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_13_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_14_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_14_shadow_b.png') },
    { right: require('../../assets/puzzles/spring_blossom/piece_15_shadow_r.png'), bottom: require('../../assets/puzzles/spring_blossom/piece_15_shadow_b.png') },
  ],
  summer_beach: [
    { right: require('../../assets/puzzles/summer_beach/piece_00_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_00_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_01_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_01_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_02_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_02_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_03_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_03_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_04_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_04_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_05_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_05_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_06_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_06_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_07_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_07_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_08_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_08_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_09_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_09_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_10_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_10_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_11_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_11_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_12_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_12_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_13_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_13_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_14_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_14_shadow_b.png') },
    { right: require('../../assets/puzzles/summer_beach/piece_15_shadow_r.png'), bottom: require('../../assets/puzzles/summer_beach/piece_15_shadow_b.png') },
  ],
  autumn_picnic: [
    { right: require('../../assets/puzzles/autumn_picnic/piece_00_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_00_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_01_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_01_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_02_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_02_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_03_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_03_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_04_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_04_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_05_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_05_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_06_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_06_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_07_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_07_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_08_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_08_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_09_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_09_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_10_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_10_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_11_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_11_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_12_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_12_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_13_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_13_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_14_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_14_shadow_b.png') },
    { right: require('../../assets/puzzles/autumn_picnic/piece_15_shadow_r.png'), bottom: require('../../assets/puzzles/autumn_picnic/piece_15_shadow_b.png') },
  ],
  winter_christmas: [
    { right: require('../../assets/puzzles/winter_christmas/piece_00_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_00_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_01_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_01_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_02_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_02_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_03_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_03_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_04_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_04_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_05_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_05_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_06_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_06_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_07_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_07_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_08_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_08_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_09_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_09_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_10_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_10_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_11_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_11_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_12_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_12_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_13_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_13_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_14_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_14_shadow_b.png') },
    { right: require('../../assets/puzzles/winter_christmas/piece_15_shadow_r.png'), bottom: require('../../assets/puzzles/winter_christmas/piece_15_shadow_b.png') },
  ],
  classroom: [
    { right: require('../../assets/puzzles/classroom/piece_00_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_00_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_01_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_01_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_02_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_02_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_03_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_03_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_04_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_04_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_05_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_05_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_06_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_06_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_07_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_07_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_08_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_08_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_09_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_09_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_10_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_10_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_11_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_11_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_12_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_12_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_13_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_13_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_14_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_14_shadow_b.png') },
    { right: require('../../assets/puzzles/classroom/piece_15_shadow_r.png'), bottom: require('../../assets/puzzles/classroom/piece_15_shadow_b.png') },
  ],
  cozy_room: [
    { right: require('../../assets/puzzles/cozy_room/piece_00_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_00_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_01_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_01_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_02_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_02_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_03_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_03_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_04_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_04_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_05_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_05_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_06_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_06_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_07_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_07_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_08_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_08_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_09_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_09_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_10_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_10_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_11_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_11_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_12_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_12_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_13_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_13_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_14_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_14_shadow_b.png') },
    { right: require('../../assets/puzzles/cozy_room/piece_15_shadow_r.png'), bottom: require('../../assets/puzzles/cozy_room/piece_15_shadow_b.png') },
  ],
};
