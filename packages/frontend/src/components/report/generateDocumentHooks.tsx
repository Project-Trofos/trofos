import { Document, HeadingLevel, ISectionOptions, Packer, Paragraph, SectionType } from 'docx';
import { IPropertiesOptions } from 'docx/build/file/core-properties';
import FileSaver from 'file-saver';
import { addStandUpSection } from './standUpReportHooks';

export function generateWordDocument(event: any) {
  event.preventDefault();

  const sections: ISectionOptions[] = [];
  addStandUpSection(1, sections);

  // Create a new instance of Document for the docx module
  const content: IPropertiesOptions = {
    sections: sections,
  };
  // Call saveDocumentToFile with the document instance and a filename
  saveDocumentToFile(new Document(content), 'Report.docx');
}
/*
    The saveDocumentToFile function creates a new instance of Packer from the docx modules, 
    Packers in docx are used to turn your JavaScript code into a .docx file. 
    We then send our document instance to Packers toBlob function 
    which in turn converts our instance of Document into a Blob object, 
    a mimeType is added to the Blob 
    and finally the Blob is sent to saveAs feature of the file-saver module 
    which will create the file and prompt you to save or open.
    */
function saveDocumentToFile(doc: any, fileName: any) {
  // Create new instance of Packer for the docx module
  // Create a mime type that will associate the new file with Microsoft Word
  const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  // Create a Blob containing the Document instance and the mimeType
  Packer.toBlob(doc).then((blob) => {
    const docblob = blob.slice(0, blob.size, mimeType);
    // Save the file using saveAs from the file-saver package
    FileSaver.saveAs(docblob, fileName);
  });
}
