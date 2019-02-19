import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import {List, InputItem, NavBar, Icon, Checkbox, Button, TextareaItem, Toast, Modal} from 'antd-mobile';
import { createForm } from 'rc-form';
import globalVal from '@/utils/global_val';
import { addAddr, editAddr } from './api';
import styles from './styles.module.css';
import {deleteAddress} from "../AddressList/api";

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
    this.props.history.push({ pathname: '/CitySelector' });
  }

  onBack = () => {
    this.props.history.goBack();
  }

  onDelete = async () => {
    const alert = Modal.alert;

    alert('删除地址', '确认删除地址吗？',
        [{ text: "取消", onPress: () => { return null } },
          { text: "确认", onPress: () => this.deleteConfirm(this.state.id) },
        ]
    );
  }

  deleteConfirm = async (id) => {
    Toast.loading("请稍后...", 3);
    const data = await deleteAddress(id);
    Toast.hide();
    if (data.code === 100000) {
      Toast.success('删除成功');
    } else {
      Toast.fail('删除失败');
    }
    this.props.history.goBack();
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

    if (!this.checkInput()) {
      return;
    }

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
    if (!globalVal.routeAddrInfo) {
      const res = await addAddr(params);
      Toast.hide();
      if (res.error) {
        Toast.fail(res.error);
        return;
      }
      Toast.success('添加成功');
    } else {
      params.id = id;
      const res = await editAddr(params);
      Toast.hide();
      if (res.error) {
        Toast.fail(res.error);
        return;
      }
      Toast.success('修改成功');
    }
    globalVal.routeAddrInfo = null;
    this.props.history.goBack();
  }
  // #endregion

  // #region 方法
  checkInput = () => {
    const { cityCode } = this.state;
    const { address, name, mobile } = this.props.form.getFieldsValue();
    if (!cityCode) {
      Toast.info('请选择城市');
      return false;
    }
    if (!address) {
      Toast.info('请输入详细地址');
      return false;
    }
    if (!name) {
      Toast.info('请输入姓名');
      return false;
    }
    if (!mobile) {
      Toast.info('请输入电话号码，以便服务人员联系您');
      return false;
    }
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(mobile))) {
      Toast.info('请输入电话号码格式有误');
      return false;
    }

    return true;
  }
  // #endregion

  // #region render

  renderNavbar = () => {
    const title = globalVal.routeAddrInfo ? '更改服务地址' : '添加服务地址';
    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={this.onBack}
      rightContent={
      <div onClick={this.onDelete}>删除</div>
      }
    >{title}</NavBar>);
  }

  render() {
    const { getFieldProps } = this.props.form;
    const { address, cityName, mobile, name, remark, isDefault, alreadyIsDefault } = this.state;
    return (
      <div>
        {this.renderNavbar()}
        <List renderHeader={() => '服务地址'} >
          <Item arrow="horizontal" extra={cityName} onClick={this.onNavCitySelector}>所在城市:</Item>
          <InputItem
            {...getFieldProps('address', {
              initialValue: address,
            })}
            clear
            placeholder="请输入详细地址"
          >详细地址:</InputItem>
        </List>
        <List renderHeader={() => '联系人'} >
          <InputItem
            {...getFieldProps('name', {
              initialValue: name,
            })}
            clear
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
            })}
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
          {alreadyIsDefault === 0 ?
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
