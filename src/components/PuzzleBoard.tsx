import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { PUZZLE_COVERS, PUZZLE_MANIFEST, PUZZLE_PIECES } from '../constants/puzzleAssets';
import { colors, radius } from '../constants/colors';

interface Props {
  assetKey: string;
  collectedPieces: number; // 앞 인덱스(0)부터 순서대로 모은 것으로 간주
  size: number; // 보드 한 변 길이(정사각형, px)
}

// 놀이 탭 퍼즐 보드. 아직 못 모은 자리는 완성본을 아주 흐리게 깔아 힌트만 주고,
// 모은 조각은 manifest 좌표에 맞춰 실제 직소 조각 이미지를 그 위에 쌓아 올린다.
export default function PuzzleBoard({ assetKey, collectedPieces, size }: Props) {
  const cover = PUZZLE_COVERS[assetKey];
  const pieces = PUZZLE_PIECES[assetKey];
  const scale = size / PUZZLE_MANIFEST.canvasSize;

  if (!cover || !pieces) {
    return <View style={[styles.board, { width: size, height: size, backgroundColor: colors.track }]} />;
  }

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      <Image source={cover} style={[StyleSheet.absoluteFillObject, styles.ghost]} resizeMode="cover" />
      {PUZZLE_MANIFEST.pieces.map((layout) => {
        if (layout.index >= collectedPieces) return null;
        return (
          <Image
            key={layout.index}
            source={pieces[layout.index]}
            style={{
              position: 'absolute',
              left: layout.x * scale,
              top: layout.y * scale,
              width: layout.width * scale,
              height: layout.height * scale,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.track,
  },
  ghost: {
    opacity: 0.16,
  },
});
