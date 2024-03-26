import { Input, Typography, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetProjectQuery, useUpdateTelegramIdMutation } from '../../api/project';
import { useState } from 'react';

export default function ProjectTelegramForm(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);

  const { data } = useGetProjectQuery({ id: projectId });
  const [updateTelegram] = useUpdateTelegramIdMutation();
  const [value, setValue] = useState(data?.telegramChannelLink);

  return (
    <>
      <Typography>
        To receive notifications in your telegram channel, first add the @trofos_nus_bot to your telegram channel and
        run <code>/start</code>. After that, copy the id here.
      </Typography>
      <Input
        onBlur={(e) => {
          try {
            updateTelegram({ projectId, telegramId: e.currentTarget.value });
            message.success("Changed telegram channel id")
          } catch (e) {
            message.warning("error")
          }
          
        }}
        value={value}
        onInput={(e) => setValue(e.currentTarget.value)}
        placeholder="Enter Github Repository URL (e.g https://github.com/Project-Trofos/trofos.git)..."
      />
    </>
  );
}
