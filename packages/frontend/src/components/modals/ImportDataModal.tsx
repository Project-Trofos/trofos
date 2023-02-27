import React, { useState } from "react";
import { UploadOutlined } from '@ant-design/icons';
import { Button, Modal, message, Upload, Space } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useImportCsvMutation } from "../../api/course";
import { getErrorMessage } from "../../helpers/error";
import { CourseData, ProjectData } from '../../api/types';

const CSV_TEMPLATE_PATH = "/download/importCourseData.csv";
const CSV_TEMPLATE_NAME = "importCourseData.csv";

export default function ImportDataModal({ course, projects } : { course: CourseData | undefined, projects: ProjectData[] | undefined }) : JSX.Element {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [importCsv] = useImportCsvMutation();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        if (!projects || projects.length > 0) {
            message.error("Course already has projects. Please delete them before uploading a new CSV file.");
        } else {
            const formData = new FormData();
            formData.append('file', fileList[0] as RcFile);
            setIsUploading(true);
            try {
                if (course) {
                    await importCsv({
                        courseId: course.id,
                        payload: formData
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
            title="Import CSV Data" 
            okButtonProps={{
                disabled: fileList.length === 0,
                loading: isUploading
            }} 
            okText={isUploading ? 'Uploading' : 'Import'}
            open={isModalOpen} 
            onOk={handleOk} 
            onCancel={handleCancel}
        >
            <Space direction="vertical">
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Upload {...props}>
                        <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
                <a href={CSV_TEMPLATE_PATH} download={CSV_TEMPLATE_NAME}>Download csv template</a>
            </Space>
        </Modal>
      </>
    )
}