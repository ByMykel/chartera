// @ts-ignore
import axios from 'axios';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Canvas from './Canvas';
import { convertData } from './Helpers';
import { binanceApi, corsProxy } from '../constants';
import Spinner from '../Spinner/Spinner';

const ChartContainer: React.FC<RouteComponentProps> = function ({ history }) {
  const [data, setData] = React.useState<unknown>([]);
  const [prevMonthStamp] = React.useState<number>(() => {
    const d: Date = new Date();
    d.setMonth(d.getMonth() - 20);// timestamp of x months ago
    d.setHours(0, 0, 0, 0);
    return (Number(d) / 1000 | 0) * 1000;
  });

  React.useEffect(() => {
    const url : string = binanceApi;
    const proxyUrl : string = corsProxy;
    axios({
      method: 'get',
      url: proxyUrl + url
    }).then((res) => {
      if (prevMonthStamp) {
        setData(res.data.filter((i: number[]) => i[0] >= prevMonthStamp));
      }
    }).catch((err) => {
      console.log(err);
      history.push('/error');
    });
  }, [prevMonthStamp, history]);

  if (Array.isArray(data) && data?.length > 0) {
    return (
      <Canvas dataProp={convertData(data)} />
    );
  }
  return <Spinner />;
};
export default ChartContainer;
