import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import { useAddChannelMutation, useEditChannelMutation } from '../api';
import { uiActions } from '../store/ui';


const ChannelForm = ({ inputRef }) => {
  const dispatch = useDispatch();
  const [ addChannel, { error: addChannelError, isLoading: isLoadingAddChannel, isError: isErrorAddChannel } ] = useAddChannelMutation();
  const [ editChannel, { error: editChannelError, isLoading: isLoadingEditChannel, isError: isErrorEditChannel } ] = useEditChannelMutation();
  const channels = useSelector((state) => state.auth.channels);
  const ui = useSelector((state) => state.ui);
  const { modal, channelNameForRename } = ui;
  const { type, extra } = modal;

  const uiMap = {
    'addChannel': { initialName: '', isLoading: isLoadingAddChannel },
    'renameChannel': { initialName: channelNameForRename, isLoading: isLoadingEditChannel },
  };

  const actionsMap = {
    'addChannel': {
      fn: (data) => addChannel(data).unwrap(),
      isError: isErrorAddChannel,
      error: addChannelError,
    },
    'renameChannel': {
      fn: (data) => editChannel(data).unwrap(),
      isError: isErrorEditChannel,
      error: editChannelError,
    },
  };

  const schema = yup.object().shape({
    name: yup.string()
      .min(3, 'От 3 до 20 символов')
      .max(20, 'От 3 до 20 символов')
      .required('Обязательное поле')
      .notOneOf(Object.values(channels.map(({ name }) => (name))), 'Должно быть уникальным'),
  });

  return (
    <Formik
      initialValues={{ name: uiMap[type].initialName }}
      enableReinitialize={true}
      validationSchema={schema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={ async (values, { resetForm }) => {
        const data = (type === 'addChannel') ? values : { id: extra.channelId, name: values };
        actionsMap[type].fn(data);
        if (actionsMap[type].isError) {
          console.log(actionsMap[type].error);
        }
        resetForm();
        dispatch(uiActions.setIsModalOpened(false));
      }}
    >
    {({ errors, touched }) => (
      <Form>
        <div>
          <Field
            name="name"
            id="name"
            innerRef={inputRef}
            className={cn('mb-2 form-control', {
              'is-invalid': errors.name && touched.name,
            })}
          />
            {errors.name && touched.name ? (<div className='invalid-feedback'>{errors.name}</div>) : null}
            <div className="d-flex justify-content-end">
              <button className="me-2 btn btn-secondary" type="button"
                onClick={() => dispatch(uiActions.setIsModalOpened(false))}
              >Отменить</button>
              <button className="btn btn-primary" type="submit"
                disabled={uiMap[type].isLoading}
              >Отправить</button>
            </div>
        </div>
      </Form>
    )}
    </Formik>
  )
};

export default ChannelForm;
