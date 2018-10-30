import {combineSelectors} from 'utils';

import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';

import registerWidgetType from 'registerWidgetType';
import {editingWidget, widgetAttribute} from 'widgets/selectors';
import {file} from 'files/selectors';

class TitleLoadingSpinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fade: false,
      hidden: PAGEFLOW_EDITOR
    };
  }

  componentDidMount() {
    this.setState({fade: true});

    if (PAGEFLOW_EDITOR) {
      return;
    }

    this.hiddenTimeout = setTimeout(
      () => this.setState({hidden: true}),
      9000
    );
  }

  componentWillUnmount() {
    clearTimeout(this.fadeTimeout);
    clearTimeout(this.hiddenTimeout);
  }

  render() {
    const {editing, title, subtitle} = this.props;
    const {hidden, fade} = this.state;

    if (editing || !hidden) {
      return (
        <div className={classNames('title_loading_spinner', {'title_loading_spinner-fade': fade})}
             onTouchMove={preventScrollBouncing}
             style={inlineStyle()}>
          <div className="title_loading_spinner-logo" />
          <div className="title_loading_spinner-image"
               style={backgroundImageInlineStyles(this.props)} />
          <div className="title_loading_spinner-titles">
            <div className="title_loading_spinner-title">
              {title}
            </div>
            <div className="title_loading_spinner-subtitle">
              {subtitle}
            </div>
          </div>
        </div>
      );
    }
    else {
      return <noscript />;
    }
  }
}

function inlineStyle() {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 100,
    backgroundColor: '#000'
  };
}

function backgroundImageInlineStyles({backgroundImage}) {
  if (backgroundImage) {
    return {
      backgroundImage: `url("${backgroundImage.urls.medium}")`
    };
  }
}

function preventScrollBouncing(e) {
  e.preventDefault();
}

export function register() {
  registerWidgetType('title_loading_spinner', {
    component: connect(combineSelectors({
      editing: editingWidget({role: 'loading_spinner'}),
      backgroundImage: file('imageFiles', {
        id: widgetAttribute('customBackgroundImageId', {
          role: 'loading_spinner'
        })
      }),
      title: widgetAttribute('title', {role: 'loading_spinner'}),
      subtitle: widgetAttribute('subtitle', {role: 'loading_spinner'})
    }))(TitleLoadingSpinner)
  });
}
