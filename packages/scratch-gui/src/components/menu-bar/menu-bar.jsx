import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import intlShape from '../../lib/intlShape.js';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';

import VM from '@scratch/scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import Divider from '../divider/divider.jsx';
import SaveStatus from './save-status.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import SettingsMenu from './settings-menu.jsx';
import FileMenu from './file-menu.jsx';
import EditMenu from './edit-menu.jsx';
import ModeMenu from './mode-menu.jsx';
import AboutMenu from './about-menu.jsx';

import {openTipsLibrary, openDebugModal} from '../../reducers/modals';
import {
    isTimeTravel220022BC,
    isTimeTravel1920,
    isTimeTravel1990,
    isTimeTravel2020,
    isTimeTravelNow,
    setTimeTravel
} from '../../reducers/time-travel';
import {
    requestNewProject,
    manualUpdateProject,
    remixProject
} from '../../reducers/project-state';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import remixIcon from './icon--remix.svg';
import debugIcon from '../debug-modal/icons/icon--debug.svg';

import sharedMessages from '../../lib/shared-messages';

const ariaMessages = defineMessages({
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    },
    debug: {
        id: 'gui.menuBar.debug',
        defaultMessage: 'Debug',
        description: 'accessibility text for the debug button'
    }
});

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickNew',
            'handleKeyPress',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage'
        ]);
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.props.onClickSave();
            event.preventDefault();
        }
    }
    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state."
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    render () {
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.props.onClickRemix}
            >
                {remixMessage}
            </Button>
        );

        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
                aria-label={this.props.ariaLabel}
                role={this.props.ariaRole}
                element="header"
            >
                <div className={styles.mainMenu}>
                    <div className={styles.fileGroup}>
                        {(this.props.canChangeColorMode || this.props.canChangeLanguage || this.props.canChangeTheme) &&
                        (<SettingsMenu
                            canChangeLanguage={this.props.canChangeLanguage}
                            canChangeColorMode={this.props.canChangeColorMode}
                            canChangeTheme={this.props.canChangeTheme}
                            hasActiveMembership={this.props.hasActiveMembership}
                            isRtl={this.props.isRtl}
                            depth={1}
                        />)}
                        {(this.props.canManageFiles) && (<FileMenu
                            onStartSelectingFileUpload={this.props.onStartSelectingFileUpload}
                            onClickNew={this.handleClickNew}
                            onClickRemix={this.props.onClickRemix}
                            onClickSave={this.props.onClickSave}
                            getSaveToComputerHandler={this.getSaveToComputerHandler}
                            canSave={this.props.canSave}
                            canCreateCopy={this.props.canCreateCopy}
                            canRemix={this.props.canRemix}
                            intl={this.props.intl}
                            isRtl={this.props.isRtl}
                            remixMessage={remixMessage}
                            depth={1}
                        />)}
                        <EditMenu
                            isRtl={this.props.isRtl}
                            onRestoreOption={this.handleRestoreOption}
                            restoreOptionMessage={this.restoreOptionMessage}
                            depth={1}
                        />
                        {this.props.isTotallyNormal && (<ModeMenu
                            modeNow={this.props.modeNow}
                            mode2020={this.props.mode2020}
                            isRtl={this.props.isRtl}
                            depth={1}
                        />)}
                    </div>
                    {this.props.canEditTitle ? (
                        <div className={classNames(styles.menuBarItem, styles.growable)}>
                            <ProjectTitleInput
                                className={classNames(styles.titleFieldGrowable)}
                            />
                        </div>
                    ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                        <AuthorInfo
                            className={styles.authorInfo}
                            imageUrl={this.props.authorThumbnailUrl}
                            projectTitle={this.props.projectTitle}
                            userId={this.props.authorId}
                            username={this.props.authorUsername}
                            avatarBadge={this.props.authorAvatarBadge}
                        />
                    ) : null)}
                    <div className={classNames(styles.menuBarItem)}>
                        {this.props.canRemix ? remixButton : []}
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div className={styles.fileGroup}>
                        <button
                            aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                            className={
                                classNames(styles.menuBarItem, styles.noOffset, styles.hoverable, 'tutorials-button')
                            }
                            onClick={this.props.onOpenTipLibrary}
                        >
                            <img
                                className={styles.helpIcon}
                                src={helpIcon}
                            />
                            <span className={styles.tutorialsLabel}>
                                <FormattedMessage {...ariaMessages.tutorials} />
                            </span>
                        </button>
                        <button
                            aria-label={this.props.intl.formatMessage(ariaMessages.debug)}
                            className={classNames(styles.menuBarItem, styles.noOffset, styles.hoverable)}
                            onClick={this.props.onOpenDebugModal}
                        >
                            <img
                                className={styles.helpIcon}
                                src={debugIcon}
                            />
                            <span className={styles.debugLabel}>
                                <FormattedMessage {...ariaMessages.debug} />
                            </span>
                        </button>
                    </div>
                </div>

                <div className={styles.accountInfoGroup}>
                    <div className={styles.menuBarItem}>
                        {this.props.canSave ? (
                            <SaveStatus className={classNames(styles.hoverable, styles.menuBarItem)} />
                        ) : this.props.showSaveToComputer && (
                            <SB3Downloader>{(className, downloadProjectCallback) => (
                                <button
                                    className={classNames(className, styles.hoverable, styles.menuBarItem)}
                                    onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                >
                                    <FormattedMessage
                                        defaultMessage="Save to your computer"
                                        description="Menu bar item for downloading a project to your computer"
                                        id="gui.menuBar.downloadToComputer"
                                    />
                                </button>
                            )}</SB3Downloader>
                        )}
                    </div>
                </div>

                {this.props.onClickAbout && (
                    <AboutMenu
                        onClick={this.props.onClickAbout}
                        isRtl={this.props.isRtl}
                        depth={1}
                    />
                )}
            </Box>
        );
    }
}

MenuBar.propTypes = {
    ariaLabel: PropTypes.string,
    ariaRole: PropTypes.string,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorAvatarBadge: PropTypes.number,
    canChangeLanguage: PropTypes.bool,
    canChangeColorMode: PropTypes.bool,
    canChangeTheme: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    currentLocale: PropTypes.string.isRequired,
    hasActiveMembership: PropTypes.bool,
    intl: intlShape,
    isRtl: PropTypes.bool,
    isTotallyNormal: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    mode1920: PropTypes.bool,
    mode1990: PropTypes.bool,
    mode2020: PropTypes.bool,
    mode220022BC: PropTypes.bool,
    modeNow: PropTypes.bool,
    onClickAbout: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            onClick: PropTypes.func
        }))
    ]),
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onOpenDebugModal: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onSetTimeTravelMode: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    platform: PropTypes.string,
    projectTitle: PropTypes.string,
    showSaveToComputer: PropTypes.bool,
    username: PropTypes.string,
    userOwnsProject: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state, ownProps) => ({
    currentLocale: state.locales.locale,
    isRtl: state.locales.isRtl,
    locale: state.locales.locale,
    projectTitle: state.scratchGui.projectTitle,
    username: ownProps.username ?? (
        state.session && state.session.session && state.session.session.user ?
            state.session.session.user.username : null
    ),
    vm: state.scratchGui.vm,
    mode220022BC: isTimeTravel220022BC(state),
    mode1920: isTimeTravel1920(state),
    mode1990: isTimeTravel1990(state),
    mode2020: isTimeTravel2020(state),
    modeNow: isTimeTravelNow(state)
});

const mapDispatchToProps = dispatch => ({
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onOpenDebugModal: () => dispatch(openDebugModal()),
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickRemix: () => dispatch(remixProject()),
    onSetTimeTravelMode: mode => dispatch(setTimeTravel(mode))
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
