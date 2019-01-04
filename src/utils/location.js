const BaiduMap_URL = 'http://api.map.baidu.com/geocoder/v2/?output=json&ak=ERnx6GkAYqRUaygi0XCEzVI6Ht0PnxAs&location=';

const geolocation = new window.BMap.Geolocation();

//获取经纬度
const getLongitudeAndLatitude = () => {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      location => {
        resolve([location.longitude, location.latitude]);
      },
      error => {
        reject(error);
      }
    );
  });
};

//获取网络数据
const getNetData = url => {
  return new Promise((resolve, reject) => {
    window.$.ajax({
      url,
      dataType: 'jsonp',
      callback: 'BMap._rd._cbk43398',
      success: function (res) {
        resolve(res);
      },
      error: function (error) {
        reject(error);
      }
    });
  });
};

//获取城市定位信息
export const getCityLocation = () => {
  return new Promise((resolve, reject) => {
    getLongitudeAndLatitude()
      //获取经纬度的方法返回的是经纬度组成的数组
      .then(locationArr => {
        let longitude = locationArr[0];
        let latitude = locationArr[1];
        const url = `${BaiduMap_URL}${latitude},${longitude}`;
        getNetData(url)
          .then(data => {
            if (data.status === 0) {
              resolve(data);
            } else {
              reject(data.code);
            }
          })
          .catch(data => {
            reject(data.code);
          });
      })
      .catch(data => {
        reject(data.code);
      });
  });
};
