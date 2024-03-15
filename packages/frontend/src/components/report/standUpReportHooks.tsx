import { HeadingLevel, ISectionOptions, Paragraph, SectionType, Table, TableCell, TableRow } from 'docx';
import { User } from '../../api/types';
import { StandUp, StandUpNote } from '../../api/standup';

type ReportStandUpNote = Pick<StandUp, 'date'> &
  StandUpNote &
  Pick<User, 'user_display_name'> & { column_name: string };
// TODO: Replace mock data with actual data
const standUpNotes: Array<ReportStandUpNote> = [
  {
    date: new Date(),
    id: 1,
    column_id: 1,
    column_name: 'What I did',
    stand_up_id: 1,
    user_id: 1,
    content: 'I did this',
    user_display_name: 'User 1',
  },
  {
    date: new Date(),
    id: 2,
    column_id: 2,
    column_name: 'What to do',
    stand_up_id: 1,
    user_id: 3,
    content: 'I will do that',
    user_display_name: 'User 3',
  },
  {
    date: new Date(),
    id: 3,
    column_id: 3,
    column_name: 'Blockers',
    stand_up_id: 1,
    user_id: 2,
    content: 'Blocked by obstacle',
    user_display_name: 'User 2',
  },
];

export function addStandUpSection(projectId: number, sections: ISectionOptions[]): void {
  sections.push({
    properties: {
      type: SectionType.CONTINUOUS,
    },
    children: [
      new Paragraph({
        text: 'Stand Ups',
        heading: HeadingLevel.HEADING_2,
      }),
      ...getAllStandUps(),
    ],
  });
}

function getAllStandUps(): Array<Paragraph | Table> {
  const standUps: Array<Paragraph | Table> = [];
  const standUpDateSet = new Set<Date>();
  const userMap = new Map<number, string>();
  const columnMap = new Map<number, string>();

  for (const note of standUpNotes) {
    standUpDateSet.add(note.date);
    userMap.set(note.user_id, note.user_display_name);
    columnMap.set(note.column_id, note.column_name);
  }

  // Sort in ascending order
  const sortedDates = Array.from(standUpDateSet).sort((a, b) => a.getTime() - b.getTime());

  for (const standUpDate of sortedDates) {
    addStandUpTitle(standUpDate.toDateString(), standUps);
    addStandUpTable(standUpDate, userMap, columnMap, standUps);
  }

  return standUps;
}

function addStandUpTitle(title: string, standUps: Array<Paragraph | Table>): void {
  const dateHeading = new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_4,
  });
  standUps.push(dateHeading);
}

function addStandUpTable(
  standUpDate: Date,
  userMap: Map<number, string>,
  columnMap: Map<number, string>,
  standUps: Array<Paragraph | Table>,
): void {
  // Note: StandUps of the same dates will be merged into one table
  const standUpNotesForDate = standUpNotes.filter((note) => note.date === standUpDate);
  // Sort in ascending order
  const sortedColumnIds = Array.from(columnMap.keys()).sort();

  const tableRows: TableRow[] = [];
  addHeaderRow(sortedColumnIds, columnMap, tableRows);

  addUserRows(standUpNotesForDate, sortedColumnIds, userMap, tableRows);

  standUps.push(
    new Table({
      rows: tableRows,
    }),
  );
}

function addHeaderRow(sortedColumnIds: number[], columnMap: Map<number, string>, tableRows: TableRow[]): void {
  const headerCells: TableCell[] = [new TableCell({ children: [new Paragraph({ text: 'Users' })] })];
  for (const colId of sortedColumnIds) {
    headerCells.push(new TableCell({ children: [new Paragraph({ text: columnMap.get(colId) })] }));
  }
  tableRows.push(new TableRow({ children: headerCells }));
}

function addUserRows(
  standUpNotesForDate: ReportStandUpNote[],
  sortedColumnIds: number[],
  userMap: Map<number, string>,
  tableRows: TableRow[],
): void {
  // Sort in ascending order
  const sortedUserIds = Array.from(userMap.keys()).sort();
  for (const userId of sortedUserIds) {
    const tableCells: TableCell[] = [];

    // Add user name column
    tableCells.push(new TableCell({ children: [new Paragraph({ text: userMap.get(userId) })] }));

    // Add stand up notes for each column
    for (const colId of sortedColumnIds) {
      const paragraphs: Paragraph[] = standUpNotesForDate
        .filter((note) => note.user_id == userId && note.column_id == colId)
        .map((note) => {
          return new Paragraph({ text: note.content });
        });
      tableCells.push(new TableCell({ children: paragraphs }));
    }

    tableRows.push(
      new TableRow({
        children: tableCells,
      }),
    );
  }
}
