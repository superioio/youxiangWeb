import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { List, InputItem, NavBar, Icon, Checkbox, Button, TextareaItem, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import globalVal from '@/utils/global_val';
import { addAddr, editAddr } from './api';
import styles from './styles.module.css';

const Item = List.Item;

class AddressEdit extends Component {
  // #region 构造器
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      cityCode: '',
      cityName: '',
      address: '',
      name: '',
      mobile: '',
      gender: 1,
      remark: "",
      isDefault: 0,

      alreadyIsDefault: 0,

      isFromPay: this.props.location.state
        ? this.props.location.state.isFromPay : false,
    };
  }

  // #endregion

  // #region 生命周期

  async componentDidMount() {
    const addrInfo = globalVal.routeAddrInfo;
    if (addrInfo) {
      console.log('addrInfo', addrInfo);
      this.setState({
        id: addrInfo.id,
        address: addrInfo.address,
        name: addrInfo.name,
        mobile: addrInfo.mobile,
        gender: addrInfo.gender,
        remark: addrInfo.remark,
        isDefault: addrInfo.isDefault,
        cityCode: addrInfo.cityCode,
        cityName: addrInfo.cityName,

        alreadyIsDefault: addrInfo.isDefault,
      });
    }

    if (globalVal.routeSelectCity) {
      this.setState({
        cityCode: globalVal.routeSelectCity.code,
        cityName: globalVal.routeSelectCity.name,
      }, () => {
        globalVal.routeSelectCity = null;
      });
    }
  }

  // #endregion

  // #region 响应方法
  onNavCitySelector = () => {
    this.props.history.push({ pathname: '/CitySelector', state: { fromPath: '/AddressEdit' } });
  }

  onBack = () => {
    globalVal.routeAddrInfo = null;
    this.props.history.push({ pathname: '/AddressList', state: { isFromPay: this.state.isFromPay } });
  }

  onChangeGender = (gender) => {
    this.setState({
      gender,
    });
  }

  onChangeIsDefault = (isDefault) => {
    this.setState({
      isDefault: isDefault === 0 ? 1 : 0,
    });
  }


  onSavePress = async () => {
    const { id, cityCode, gender, isDefault } = this.state;
    const { address, name, mobile, remark } = this.props.form.getFieldsValue();
    // if (!this.checkInput(address, mobile, name)) {
    //   return;
    // }

    this.props.form.validateFields(async (error, values) => {
      if (!error) {
        const customerId = globalVal.userInfo.customerId;
        const params = {
          customerId,
          gender,
          cityCode,
          address,
          mobile,
          name,
          remark,
          isDefault,
        };
        Toast.loading("请稍后...", 3);
        if (this.props.navigation.state.params.isAdd) {

          await addAddr(params);
          Toast.info('添加成功');
        } else {
          params.id = id;
          await editAddr(params);
          Toast.info('修改成功');
        }
        Toast.hide();
        this.props.history.push({ pathname: '/AddressList', state: { isFromPay: this.state.isFromPay } });
      } else {
        console.log('error', error, values);
      }
    });

  }
  // #endregion

  // checkInput(address, mobile, name) {
  //   if (address == undefined || address == '') {
  //     Alert.alert('信息有误', '请填写地址信息。',
  //       [{ text: "知道了", onPress: () => { return null } }]
  //     );
  //     return false;
  //   }
  //   if (name == undefined || name == '') {
  //     Alert.alert('信息有误', '请填写姓名。',
  //       [{ text: "知道了", onPress: () => { return null } }]
  //     );
  //     return false;
  //   }

  //   if (!this.checkTel(mobile)) {
  //     Alert.alert('信息有误', '电话号码格式不正确。',
  //       [{ text: "知道了", onPress: () => { return null } }]
  //     );
  //     return false;
  //   }
  //   return true;
  // }


  // #region render

  renderNavbar = () => {
    const title = globalVal.routeAddrInfo ? '更改服务地址' : '添加服务地址';
    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={this.onBack}
    >{title}</NavBar>);
  }

  render() {
    const { getFieldProps, getFieldError } = this.props.form;
    const { address, cityName, mobile, name, remark, isDefault, alreadyIsDefault } = this.state;
    return (
      <div>
        {this.renderNavbar()}
        <List renderHeader={() => '服务地址'} >
          <Item arrow="horizontal" extra={cityName} onClick={this.onNavCitySelector}>所在城市:</Item>
          <InputItem
            {...getFieldProps('address', {
              initialValue: address,
              rules: [{ required: true, message: '请输入详细地址' }],
            })}
            clear
            error={!!getFieldError('address')}
            onErrorClick={() => {
              alert(getFieldError('address').join('、'));
            }}
            placeholder="请输入详细地址"
          >详细地址:</InputItem>
        </List>
        <List renderHeader={() => '联系人'} >
          <InputItem
            {...getFieldProps('name', {
              initialValue: name,
              rules: [{ required: true, message: '请输入姓名' }],
            })}
            clear
            error={!!getFieldError('name')}
            onErrorClick={() => {
              alert(getFieldError('name').join('、'));
            }}
            placeholder="请输入姓名"
          >姓名:</InputItem>
          <Item>
            <div className={styles.marginLeft86}>
              <Checkbox checked={this.state.gender === 1}
                onChange={() => this.onChangeGender(1)}
              >男士</Checkbox>
              <span className={styles.marginLeft20} />
              <Checkbox checked={this.state.gender === 0}
                onChange={() => this.onChangeGender(0)}
              >女士</Checkbox>
            </div>
          </Item>
          <InputItem
            {...getFieldProps('mobile', {
              initialValue: mobile,
              rules: [{ required: true, message: '请输入电话，以便服务人员联系您' }],
            })}
            error={!!getFieldError('mobile')}
            onErrorClick={() => {
              alert(getFieldError('mobile').join('、'));
            }}
            placeholder="请输入电话，以便服务人员联系您"
          >手机:</InputItem>
          <TextareaItem
            title="备注"
            placeholder="备注信息"
            {...getFieldProps('remark', {
              initialValue: remark,
            })}
            autoHeight
          />
          {alreadyIsDefault === 1 ?
            <Item>
              <div className={styles.marginLeft86}>
                <Checkbox checked={isDefault === 1}
                  onChange={() => this.onChangeIsDefault(isDefault)}
                >设为默认地址</Checkbox>
              </div>
            </Item> : null
          }
        </List>
        <div className={styles.padding20}>
          <Button type="primary" onClick={this.onSavePress}>保存</Button>
        </div>

      </div >
    );
  }

  // #endregion
}

export default withRouter(createForm()(AddressEdit));
