

// export function isIphoneX() {
//     let dimen = Dimensions.get('window');
//     return (
//         Platform.OS === 'ios' &&
//         !Platform.isPad &&
//         !Platform.isTVOS &&
//         (dimen.height === 812 || dimen.width === 812)
//     );
// }

//日期格式转换，只有年月日
export function dateFormat(time) {
  //  const arr = str.split("-");
     const dt = new Date(time);
     return dt.getFullYear() + '年'+ (dt.getMonth() + 1) +'月' + dt.getDate() + '日';
 //   return arr[0] + '年' + arr[1] + '月' + arr[2].substr(0, 2) + '日';
}

//日期时间格式转换
export function datetimeFormat(time) {
    const dt = new Date(time);
    return dt.getFullYear() + '年'+ (dt.getMonth() + 1) +'月' + dt.getDate() + '日'+dt.getHours() + ':' + dt.getMinutes();
    // const arr = str.split("-");
    // return arr[0] + '年' + arr[1] + '月' + arr[2].substr(0, 2) + '日 ' + arr[2].substr(3, 5);
}

//1代付款，2待派单，3待服务，4已完成，5取消待审核，6取消审核未通过，7已取消
export function getStatus(statusCode) {
    let statusStr = '';
    switch (statusCode) {
        case 1:
            statusStr = "待付款";
            break;
        case 2:
            statusStr = "待派单";
            break;
        case 3:
            statusStr = "待服务";
            break;
        case 4:
            statusStr = "已完成";
            break;
        case 5:
            statusStr = "取消待审核";
            break;
        case 6:
            statusStr = "取消审核未通过";
            break;
        case 7:
            statusStr = "已取消";
            break;
        default :
            statusStr = "未知";
            break;
    }
    return statusStr;
}

//1代付款，2待派单，3待服务，4已完成，5取消待审核，6取消审核未通过，7已取消
export function getStatusCode(statusStr) {
    let statusCode = '0';
    switch (statusStr) {
        case "待付款":
            statusCode = '1';
            break;
        case "待派单":
        case "待服务":
            statusCode = '2,3';
            break;
        case "已完成":
            statusCode = '4';
            break;
        case "取消待审核":
        case "已取消":
            statusCode = '5,7';
            break;
        case "取消审核未通过":
            statusCode = '6';
            break;
        default :
            statusCode = '0';
            break;
    }
    // let statusCode = 0;
    // switch (statusStr) {
    //   case "待付款":
    //     statusCode = 1;
    //     break;
    //   case "待派单":
    //     statusCode = 2;
    //     break;
    //   case "待服务":
    //     statusCode = 3;
    //     break;
    //   case "已完成":
    //     statusCode = 4;
    //     break;
    //   case "取消待审核":
    //     statusCode = 5;
    //     break;
    //   case "取消审核未通过":
    //     statusCode = 6;
    //     break;
    //   case "已取消":
    //     statusCode = 7;
    //     break;
    //   default :
    //     statusCode = 0;
    //     break;
    // }
    return statusCode;
}