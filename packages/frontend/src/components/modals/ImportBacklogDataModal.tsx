import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Modal, message, Upload, Space } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useParams } from 'react-router-dom';
import { useImportBacklogCsvMutation } from '../../api/backlog';
import { getErrorMessage } from '../../helpers/error';

const CSV_TEMPLATE_PATH = '/download/importBacklogData.csv';
const CSV_TEMPLATE_NAME = 'importBacklogData.csv';

export default function ImportBacklogDataModal(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importBacklogCsv] = useImportBacklogCsvMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const formData = new FormData();
    formData.append('file', fileList[0] as RcFile);
    setIsUploading(true);
    try {
      await importBacklogCsv({
        projectId,
        payload: formData,
      }).unwrap();
      setFileList([]);
      message.success('Backlogs imported successfully.');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Import CSV Data
      </Button>
      <Modal
        title="Import Backlogs from CSV Data"
        okButtonProps={{
          disabled: fileList.length === 0,
          loading: isUploading,
        }}
        okText={isUploading ? 'Uploading' : 'Import'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Space direction="vertical">
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Upload data-testid="upload-button" {...props}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <a href={CSV_TEMPLATE_PATH} download={CSV_TEMPLATE_NAME}>
            Download csv template
          </a>
        </Space>
      </Modal>
    </>
  );
}
