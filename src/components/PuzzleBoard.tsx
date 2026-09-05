import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { PUZZLE_COVERS, PUZZLE_MANIFEST, PUZZLE_PIECE_SHADOWS, PUZZLE_PIECES } from '../constants/puzzleAssets';
import { radius } from '../constants/colors';

interface Props {
  assetKey: string;
  collectedPieces: number; // 앞 인덱스(0)부터 순서대로 모은 것으로 간주
  size: number; // 보드 한 변 길이(정사각형, px)
}

// 놀이 탭 퍼즐 보드. 아직 못 모은 자리는 완성본을 아주 흐리게 깔아 힌트만 주고,
// 모은 조각은 manifest 좌표에 맞춰 실제 직소 조각 이미지를 그 위에 쌓아 올린다.
//
// 조각 이미지 자체가 배경(연한 회색)과 색이 비슷한 경우(하늘, 눈 등) 경계가 잘 안 보이는
// 문제가 있어서, ① 보드 배경을 한 톤 더 진하게, ② 힌트 이미지를 살짝 더 진하게 했다.
// ③ 조각의 홈(오목한) 부분 그림자는 오른쪽/아래쪽 이웃이 "아직 안 모아졌을 때만"
// PUZZLE_PIECE_SHADOWS 오버레이를 조각 위에 겹쳐서 만든다 (아래 showRightShadow/showBottomShadow 참고).
// 조각은 항상 인덱스 순서(= 위→아래, 왼쪽→오른쪽 raster 순서)로 모으기 때문에,
// 왼쪽/위쪽 이웃은 항상 이미 모아져 있어서 그 방향 그림자는 애초에 만들지도 않는다.
// ④ 방금 새로 모은 조각(collectedPieces가 늘어나서 새로 나타난 그 하나)만 톡 튀어 오르며
// 등장 + 흰색 플래시가 살짝 스치는 애니메이션을 준다. 화면 첫 진입 시 이미 모아둔 조각들이
// 한꺼번에 팝인하면 산만해 보여서, "이전 렌더보다 늘어난 마지막 조각"만 골라서 애니메이션한다
// (아래 prevCollectedRef 비교 로직 참고). assetKey가 바뀌는(다음 퍼즐 세트로 넘어가는) 경우는
// 조각 수 비교가 의미 없으므로 애니메이션을 건너뛴다.
//
// (참고: 직선 격자선, RN 박스 셰도우(elevation)는 모두 시도했지만 조각의 알파 모양을
//  무시하고 사각형 테두리/그림자를 그려서 배경과 안 어울리는 직선 이음매가 생겨 뺐다.
//  Android의 elevation은 특히 투명한 부분까지 포함한 View의 사각 바운딩 박스 기준으로
//  그림자를 그리기 때문에, 하늘처럼 밋밋한 배경에서 조각의 사각 경계가 그대로 드러났다.
//  조각 이미지 자체에 그림자를 구워 넣는 것도 시도했지만, 그러면 이웃 조각을 이미 모아서
//  실제로는 이어붙은 자리에도 그림자가 그대로 남아 이음새가 어색해 보였다. 그래서 지금은
//  그림자를 별도 오버레이로 분리해 "진짜 빈 자리"일 때만 보이게 한다.)
export default function PuzzleBoard({ assetKey, collectedPieces, size }: Props) {
  const cover = PUZZLE_COVERS[assetKey];
  const pieces = PUZZLE_PIECES[assetKey];
  const shadows = PUZZLE_PIECE_SHADOWS[assetKey];
  const scale = size / PUZZLE_MANIFEST.canvasSize;
  const { cols, rows } = PUZZLE_MANIFEST;

  // 방금 추가된 조각 인덱스만 짚어서 등장 애니메이션을 태운다.
  const prevKeyRef = useRef(assetKey);
  const prevCollectedRef = useRef(collectedPieces);
  const [newIndex, setNewIndex] = useState<number | null>(null);
  const pieceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const assetChanged = prevKeyRef.current !== assetKey;
    const prevCount = prevCollectedRef.current;
    if (!assetChanged && collectedPieces > prevCount) {
      setNewIndex(collectedPieces - 1);
      pieceAnim.setValue(0);
      Animated.spring(pieceAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 14,
      }).start(() => setNewIndex(null));
    }
    prevKeyRef.current = assetKey;
    prevCollectedRef.current = collectedPieces;
  }, [assetKey, collectedPieces]);

  if (!cover || !pieces) {
    return <View style={[styles.board, { width: size, height: size }]} />;
  }

  const pieceScale = pieceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const flashOpacity = pieceAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] });

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      <Image source={cover} style={[StyleSheet.absoluteFillObject, styles.ghost]} resizeMode="cover" />

      {PUZZLE_MANIFEST.pieces.map((layout) => {
        if (layout.index >= collectedPieces) return null;

        // 오른쪽/아래쪽 이웃이 아직 안 모아졌으면(= 진짜 빈 옆자리) 그 방향 그림자를 보여준다.
        const hasRightNeighbor = layout.col < cols - 1;
        const hasBottomNeighbor = layout.row < rows - 1;
        const rightNeighborCollected = layout.index + 1 < collectedPieces;
        const bottomNeighborCollected = layout.index + cols < collectedPieces;
        const showRightShadow = hasRightNeighbor && !rightNeighborCollected;
        const showBottomShadow = hasBottomNeighbor && !bottomNeighborCollected;
        const shadow = shadows?.[layout.index];
        const isNew = layout.index === newIndex;

        return (
          <View
            key={layout.index}
            style={[
              styles.pieceShadow,
              {
                left: layout.x * scale,
                top: layout.y * scale,
                width: layout.width * scale,
                height: layout.height * scale,
              },
            ]}
          >
            {isNew ? (
              <Animated.View style={[styles.pieceImage, { opacity: pieceAnim, transform: [{ scale: pieceScale }] }]}>
                <Image source={pieces[layout.index]} style={styles.pieceImage} />
                {showRightShadow && shadow ? (
                  <Image source={shadow.right} style={styles.pieceImage} />
                ) : null}
                {showBottomShadow && shadow ? (
                  <Image source={shadow.bottom} style={styles.pieceImage} />
                ) : null}
                <Animated.View pointerEvents="none" style={[styles.pieceImage, styles.pieceFlash, { opacity: flashOpacity }]} />
              </Animated.View>
            ) : (
              <>
                <Image source={pieces[layout.index]} style={styles.pieceImage} />
                {showRightShadow && shadow ? (
                  <Image source={shadow.right} style={styles.pieceImage} />
                ) : null}
                {showBottomShadow && shadow ? (
                  <Image source={shadow.bottom} style={styles.pieceImage} />
                ) : null}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#D9E1EA',
  },
  ghost: {
    opacity: 0.24,
  },
  pieceShadow: {
    // 예전엔 여기 RN shadow*/elevation을 넣어 조각을 배경 위에 "띄웠는데",
    // 그 그림자가 조각 이미지의 실제 알파 모양이 아니라 View의 사각 바운딩 박스를
    // 따라 그려져서 배경과 안 이어지는 직선 자국이 남았다. 그림자는 이제 홈 방향별
    // 오버레이 이미지로 조건부로 그리므로 여기서는 위치만 잡아준다.
    position: 'absolute',
  },
  pieceImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  pieceFlash: {
    backgroundColor: '#FFFFFF',
  },
});
