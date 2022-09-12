import React, { useRef, useEffect, useState } from 'react';
import {
  calcTopBody, drawCandle, drawLine, drawPriceLine, getColor, drawTimeLine, drawVolumeCandle
} from './CanvasHelpers';
import { ChartRightMargin, horizontalPriceLines, verticalPriceLines } from '../../Constants/constants';
import { getChartRefPoints, DataObj } from './Helpers';

interface IProps {
  dataProp: Array<DataObj>,
  bgColor?: string
}

const Canvas: React.FC<IProps> = function ({ dataProp, bgColor = '#121212' }: IProps) {
  const [data] = useState<Array<DataObj>>(dataProp);
  const [candleWidth, setCandleWidth] = useState<number>();
  const [canvasWidth, setCanvasWidth] = useState<number>(window.innerWidth);
  const [scale, setScale] = useState<number>(0);

  const canvasRef = useRef(null);

  const zoom = (event: any) => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      if (scale === 0) {
        canvas.style.cursor = 'auto';
      } else {
        canvas.style.cursor = 'grab';
      }
    }

    setScale(Math.max(0, Math.min(scale + event.deltaY * -0.01, 10)));
    const width = window.innerWidth + 2000 * scale;
    setCanvasWidth(width);
  };

  useEffect(() => {
    window.addEventListener('wheel', zoom);
    return () => {
      window.removeEventListener('wheel', zoom);
    };
  });

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    canvas.width = canvasWidth ?? window.innerWidth;
    canvas.height = window.innerHeight;
    if (data && data.length !== 0) {
      setCandleWidth(canvas.width / data.length);
    }
  }, [data, canvasRef, canvasWidth]);

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
    canvas.width = canvasWidth ?? window.innerWidth;
    canvas.height = window.innerHeight;

    const {
      // eslint-disable-next-line no-unused-vars
      highestVal, lowestVal, maxTime, minTime, maxVolume, minVolume
    } = getChartRefPoints(data);

    /*
    The size of each unit of height
    To get sized based on   (price1-price2)*heightCubicles
    */
    const heightCubicles: number = highestVal && lowestVal ? context.canvas.height / (highestVal - lowestVal) : 0; // each price unit equals to unit * heightcubicles in canvas scale
    // eslint-disable-next-line no-unused-vars
    const widthCubciles: number = maxTime && minTime ? context.canvas.width / (maxTime - minTime) : 0;
    context.fillStyle = bgColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Width is accumulated to distribute the candles horizontally
    let accumulatedWith: number = 0;

    /* Draw horizontal lines */
    if (data && highestVal && lowestVal) drawPriceLine(context, highestVal, lowestVal, horizontalPriceLines);

    let candlesToIgnore: number = 0;
    if (candleWidth) candlesToIgnore = ChartRightMargin / candleWidth;

    /* Draw timestamp lines */
    if (maxTime && minTime) drawTimeLine(context, maxTime, minTime, verticalPriceLines, candlesToIgnore);

    // Draw the candles
    data && data.length > 0 && data.filter((i, index) => index >= candlesToIgnore).forEach((i: DataObj, index: number) => {
      // Width is accumulated only after the first candle has been drawn
      if (index > 0 && candleWidth) {
        accumulatedWith += candleWidth;
      }
      if (candleWidth && highestVal) {
        const bodyHeight: number = Math.abs((i.open - i.close) * heightCubicles);
        const tailHeight: number = (i.high - i.low) * heightCubicles;
        /* To draw the body of the candle */
        drawCandle(
          context,
          accumulatedWith,
          calcTopBody(
            data[index - (candlesToIgnore + 1)]?.close,
            i.open,
            i.close,
            heightCubicles,
            highestVal
          ),
          candleWidth,
          bodyHeight,
          getColor(i.open, i.close)
        );

        /* To draw the tail of the candle */
        const tailMarginLeft: number = accumulatedWith + (candleWidth / 2);
        const tailMarginTop: number = (highestVal - i.high) * heightCubicles;
        drawLine(context, tailMarginLeft, tailMarginTop, 1, tailHeight, getColor(i.open, i.close));
        /* draw the current price line */
        if (index === data.filter((i, index) => index >= candlesToIgnore).length - 1) drawLine(context, tailMarginLeft, 0, 0, 0, '', true);
        /* Draw volume candles */
        if (maxVolume) drawVolumeCandle(context, accumulatedWith, i.open, i.close, i.volume, maxVolume, candleWidth, canvas.height);
      }
    });
  }, [candleWidth, data, bgColor, canvasWidth]);

  return <canvas ref={canvasRef} />;
};
export default Canvas;
