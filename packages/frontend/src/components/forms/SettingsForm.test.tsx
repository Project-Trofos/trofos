import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { Settings } from '../../api/types';
import store from '../../app/store';
import SettingsForm from './SettingsForm';

describe('SettingsForm test', () => {
  const mockSettings: Settings = {
    current_sem: 1,
    current_year: 2022,
  };

  function renderForm() {
    return render(
      <Provider store={store}>
        <SettingsForm settings={mockSettings} />
      </Provider>,
    );
  }

  describe('when rendering', () => {
    it('should render according to the snapshot', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();
    });
  });
});
