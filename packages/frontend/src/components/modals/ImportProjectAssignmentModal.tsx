import { useState } from 'react';
import { Button, Modal, Upload, Space, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useImportProjectAssignmentsMutation } from '../../api/course';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '../../helpers/error';

const CSV_TEMPLATE_PATH = '/download/projectAssignments.csv';
const CSV_TEMPLATE_NAME = 'projectAssignments.csv';

const { Text } = Typography;

export default function ImportProjectAssignmentModal(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importProjectAssignment] = useImportProjectAssignmentsMutation();
  const param = useParams();
  const courseId = param.courseId;

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    if (fileList.length > 0) {
      const formData = new FormData();
      formData.append('file', fileList[0] as RcFile);

      setIsUploading(true);
      try {
        if (courseId) {
          await importProjectAssignment({
            courseId: Number(courseId),
            payload: formData,
          }).unwrap();
          setFileList([]);
          message.success('Import successful.');
        }
      } catch (error) {
        message.error(getErrorMessage(error));
      }

      setIsUploading(false);
    }

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
        Import Project Assignment CSV
      </Button>
      <Modal
        title="Import Project Assignment CSV"
        okButtonProps={{
          disabled: fileList.length === 0,
          loading: isUploading,
        }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isUploading ? 'Uploading' : 'Import'}
      >
        <Space direction="vertical">
          <Upload data-testid="upload-button" {...props}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <a href={CSV_TEMPLATE_PATH} download={CSV_TEMPLATE_NAME}>
            Download CSV template
          </a>
          <Text style={{ fontSize: 12 }}>
            Note: Since this feature matches by project names, the project names given must be unique.
          </Text>
        </Space>
      </Modal>
    </>
  );
}
