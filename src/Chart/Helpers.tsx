export const convertData = (data: (string | number)[][]) => {
  return data.map((x: (string | number)[], index: number) => {
    return {
      low: Number(x[3]),
      high: Number(x[2]),
      open: Number(x[1]),
      close: Number(x[4]),
      openTime: Number(x[0])
    }
  })
}

export const getDate = (stamp: number) => {
  let date: any = new Date(stamp )
  let month = date.getMonth()+1;
  let day = date.getDate();
  let year = date.getFullYear();
  let formattedTime = day + '/' + month + '/' + year;
  return formattedTime
}