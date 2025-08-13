import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { queryMetric, getDimensionList, getModelList } from '../../service';

import { Form, Button, Modal, Input, Select } from 'antd';
import { formLayout } from '@/components/FormHelper/utils';
import styles from '../style.less';
import { ISemantic } from '../../data';

export type CreateFormProps = {
  createModalVisible: boolean;
  termItem?: ISemantic.ITermItem;
  onCancel?: () => void;
  onSubmit?: (values: any) => void;
  domainId: number; // 当前选中的domainId
  modelId: number; // 当前选中的modelId
};

const FormItem = Form.Item;
const { TextArea } = Input;

const TermCreateForm: React.FC<CreateFormProps> = (props) => {
  const { onCancel, createModalVisible, termItem, onSubmit, domainId, modelId } = props;

  const isEdit = !!termItem?.name;
  const formValRef = useRef({} as any);
  const [form] = Form.useForm();
  const [entitySemanticOptions, setEntitySemanticOptions] = useState<{value: string; label: string}[]>([]);

  const handleEntityTypeChange = async (value: string) => {
      try {
        let res;
        // 根据选择的实体类型获取对应的语义实体列表
        if (value === 'dataset') {
          // 获取所有数据集列表
          res = await getDimensionList({ domainId, type: 'dataset' });
        } else if (value === 'indicator') {
          // 获取模型指标列表
          res = await queryMetric({ domainId, modelId });
        }
        if (res) {
          // 确保数据格式正确并设置选项
          const records = res.data?.list || [];
          setEntitySemanticOptions(records.map((item: any) => ({
            value: item.bizName, // 确保有值可用
            label: item.bizName
          })));
          return Promise.resolve();
        } else {
          setEntitySemanticOptions([]);
          message.warning('未找到相关数据');
          return Promise.resolve();
        }
      } catch (error) {
        message.error('获取数据失败');
        console.error('Failed to get data:', error);
        return Promise.reject(error);
      }
    };
  const updateFormVal = (val: any) => {
    const formVal = {
      ...formValRef.current,
      ...val,
    };
    formValRef.current = formVal;
  };

  const initData = () => {
    if (!termItem) {
      return;
    }

    const initValue = {
      ...termItem,
    };
    const editInitFormVal = {
      ...formValRef.current,
      ...initValue,
    };

    updateFormVal(editInitFormVal);
    form.setFieldsValue(initValue);
  };

  useEffect(() => {
    if (isEdit) {
      initData();
      // 如果是编辑模式，根据已有entityType加载对应的语义实体列表
      if (termItem?.entityType) {
        // 先加载选项列表
        handleEntityTypeChange(termItem.entityType).then(() => {
          // 列表加载完成后，设置选中的值
          if (termItem?.entitySemantic) {
            form.setFieldsValue({
              entitySemantic: termItem.entitySemantic
            });
          }
        });
      }
    }
  }, [termItem]);

  // 移除初始化时自动查询，仅在用户操作时触发查询


  const renderContent = () => {
    return (
      <>
        <FormItem name="name" label="知识名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="名称不可重复" />
        </FormItem>
        <FormItem name="type" label="知识类型" rules={[{ required: true, message: '请选择知识类型' }]}>
          <Select placeholder="请选择知识类型">
            <Select.Option value="term">术语</Select.Option>
            <Select.Option value="guide">指南</Select.Option>
            <Select.Option value="template">模版</Select.Option>
          </Select>
        </FormItem>
        <FormItem
          name="description"
          label={'知识内容'}
          rules={[{ required: true, message: '请输入知识内容' }]}
        >
          <TextArea placeholder="请输入知识内容" />
        </FormItem>
        <FormItem name="entityType" label="语义实体类型" rules={[{ required: true, message: '请选择语义实体类型' }]}>
          <Select placeholder="请选择语义实体类型" onChange={handleEntityTypeChange}>
            <Select.Option value="dataset">数据集</Select.Option>
            <Select.Option value="indicator">模型</Select.Option>
          </Select>
        </FormItem>
        <FormItem name="entitySemantic" label="语义实体" rules={[{ required: false, message: '请选择语义实体' }]}>
          <Select placeholder="请选择语义实体" options={entitySemanticOptions} />
        </FormItem>
        <FormItem name="alias" label={'近义词'}>
          <Select
            mode="tags"
            placeholder="输入近义词后回车确认，多近义词输入、复制粘贴支持英文逗号自动分隔"
            tokenSeparators={[',']}
            maxTagCount={9}
          />
        </FormItem>
      </>
    );
  };
  const renderFooter = () => {
    return (
      <>
        <Button onClick={onCancel}>取消</Button>
        <Button
          type="primary"
          onClick={async () => {
            const fieldsValue = await form.validateFields();
            const submitForm = {
              ...formValRef.current,
              ...fieldsValue,
            };
            updateFormVal(submitForm);
            onSubmit?.(submitForm);
          }}
        >
          完成
        </Button>
      </>
    );
  };
  return (
    <Modal
      forceRender
      width={800}
      style={{ top: 48 }}
      destroyOnClose
      title={`${isEdit ? '编辑' : '新建'}术语`}
      maskClosable={false}
      open={createModalVisible}
      footer={renderFooter()}
      onCancel={onCancel}
    >
      <>
        <Form
          {...formLayout}
          form={form}
          initialValues={{
            ...formValRef.current,
          }}
          className={styles.form}
        >
          {renderContent()}
        </Form>
      </>
    </Modal>
  );
};

export default TermCreateForm;
