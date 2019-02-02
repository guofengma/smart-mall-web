package com.emin.platform.smw.ws;


import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.io.Serializable;
import java.util.Arrays;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @auth Anson
 * @name 当前清轻量级别的cmd命令模式
 * @date 18-8-22
 * @since 1.0.0
 */
@Component
@ServerEndpoint(value = "/websocket/notify")
public class NotifyWebSocketServer {

    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(NotifyWebSocketServer.class);

    public static final String OPERATION = "OPERATION";

    public static final String VALUE = "VALUE";

    public static final String REGISTER = "register";

    public static final String CMD_PATTERN = "CMD:(?<" + OPERATION + ">[\\w]+) VALUE:(?<" + VALUE + ">[\\w]*)";

    public static final String CMD_TEMPLATE = "CMD:%s VALUE:%s";

    private static int onlineCount = 0;

    private static CopyOnWriteArraySet<NotifyWebSocketServer> webSocketSet
            = new CopyOnWriteArraySet<>();

    //与某个客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;

    /**
     * 分析命令处理工具
     * 如果是非命令的当前直接返回null
     * 若分析成功，则解析CMD的
     */
    private final static Function<String, MatcherCmd> CMD_SPILTE_FN = (e) -> {
        MatcherCmd cmd = MatcherCmd.NOT_CMD;
        if (e.isEmpty()) {
            return cmd;
        }
        e = e.trim();
        Matcher matcher = Pattern.compile(CMD_PATTERN).matcher(e);
        if (matcher.matches()) {
            String oper = matcher.group(OPERATION);
            String value = matcher.group(VALUE);
            cmd = new MatcherCmd(oper, value);
        }
        return cmd;
    };

    /**
     * 消息通知注册
     */
    private final static Function<MatcherCmd, MessageNotifyRegister> REGISTER_NOTIFY = (e) -> {
        MessageNotifyRegister register = MessageNotifyRegister.NO_REGISTER;
        if (!e.isCmd()) {
            return register;
        }
        String notifyType = e.value;
        if (REGISTER.equals(e.getOperation()) && StringUtils.isNotBlank(notifyType)) {
            register = new MessageNotifyRegister(notifyType);
        }

        return register;

    };

    /**
     * @auth Anson
     * @name 当前管道是否已经我受了
     * @date 18-8-22
     * @since 1.0.0
     */
    private boolean isHandled = false;

    /**
     * 当前通知的类型
     */
    private String notifyType = "";

    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        webSocketSet.add(this);     //加入set中
        addOnlineCount();           //在线数加1
        LOGGER.info("有新连接加入！当前在线管道为={}", getOnlineCount());
    }

    @OnClose
    public void onClose() {
        webSocketSet.remove(this);  //从set中删除
        subOnlineCount();           //在线数减1
        LOGGER.info("有一连接关闭！当前在线管道为={}", getOnlineCount());
    }


    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        LOGGER.info("来自客户端的消息,sessionId={},message={}", session.getId(), message);
        MatcherCmd cmd = CMD_SPILTE_FN.apply(message);
        if (!cmd.isCmd()) {
            LOGGER.info("来自客户端的消息,非命令结构,sessionId={},message={}", session.getId(), message);
            this.sendMessage(new MatcherCmd("cmd",
                    Boolean.valueOf(false).toString()).cmd());
            return;
        }
        if (!this.isHandled()) {
            MessageNotifyRegister register = REGISTER_NOTIFY.apply(cmd);
            boolean isRegister = register.isRegister();
            this.setHandled(isRegister);
            if (isRegister) {
                this.setNotifyType(register.getNotifyType());
            }
            this.sendMessage(new MatcherCmd("register",
                    Boolean.valueOf(isRegister).toString()).cmd());
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        LOGGER.error("发生错误,session={}", session.getId());
    }

    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }

    /**
     * 所有管道都广播自定义消息
     */
    public static void broadcast(String message) throws IOException {
        broadcast(message, (Predicate<NotifyWebSocketServer>) null);
    }

    /**
     * @param message
     * @param notifyType
     * @return void
     * @auth Anson
     * @name 按照通知类型来发送广播各自的消息
     * @date 18-8-22
     * @since 1.0.0
     */
    public static void broadcastNotifyType(String message, String notifyType) throws IOException {
        broadcast(message, e -> notifyType.equals(e.getNotifyType()));
    }


    /**
     * @param message
     * @param predicate
     * @return void
     * @auth Anson
     * @name 根据需求处理各自的管道消息发送
     * @date 18-8-22
     * @since 1.0.0
     */
    public static void broadcast(String message, Predicate<NotifyWebSocketServer>... predicate) throws IOException {
        LOGGER.info(message);
        if (webSocketSet.isEmpty()) {
            return;
        }
        for (NotifyWebSocketServer item : webSocketSet) {
            try {
                if (item.isHandled()
                        && (
                        predicate == null || (predicate = ArrayUtils.removeElements(predicate)).length > 0
                                && Arrays.stream(predicate).filter(e -> e.test(item)).count() > 0)) {
                    item.sendMessage(message);
                }
            } catch (IOException e) {
                LOGGER.error("广播发送失败,sessionId={},message={}", item.session.getId(), message);
                continue;
            }
        }
    }

    public void setHandled(boolean handled) {
        isHandled = handled;
    }

    public boolean isHandled() {
        return isHandled;
    }

    public void setNotifyType(String notifyType) {
        this.notifyType = notifyType;
    }

    public String getNotifyType() {
        return notifyType;
    }

    public Session getSession() {
        return session;
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        NotifyWebSocketServer.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        NotifyWebSocketServer.onlineCount--;
    }

    /**
     * @auth Anson
     * @name 命令模板
     * @date 18-8-22
     * @since 1.0.0
     */
    public static class MatcherCmd implements Serializable {

        public static final MatcherCmd NOT_CMD = new MatcherCmd();

        private boolean isCmd = false;
        private String operation;
        private String value;

        public MatcherCmd() {
        }

        public MatcherCmd(String operation, String value) {
            this.operation = operation;
            this.value = value;
            if (!StringUtils.isBlank(this.operation)) {
                // no blank
                this.isCmd = true;
            }
        }

        public boolean isCmd() {
            return isCmd;
        }

        public void setCmd(boolean cmd) {
            isCmd = cmd;
        }

        public String getOperation() {
            return operation;
        }

        public void setOperation(String operation) {
            this.operation = operation;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        /**
         * @param
         * @return java.lang.String
         * @auth Anson
         * @name 封装当前命令
         * @date 18-8-22
         * @since 1.0.0
         */
        public String cmd() {
            return String.format(CMD_TEMPLATE, this.operation,
                    Optional.ofNullable(this.value).orElse(""));
        }
    }

    /**
     * @auth Anson
     * @name 消息注册的逻辑
     * @date 18-8-22
     * @since 1.0.0
     */
    public static class MessageNotifyRegister implements Serializable {

        public static final MessageNotifyRegister NO_REGISTER = new MessageNotifyRegister();

        private boolean isRegister = false;
        private String notifyType = null;

        public MessageNotifyRegister() {
        }

        public MessageNotifyRegister(String notifyType) {
            this.notifyType = notifyType;
            if (!StringUtils.isBlank(notifyType)) {
                // no blank
                this.isRegister = true;
            }
        }

        public boolean isRegister() {
            return isRegister;
        }

        public void setRegister(boolean register) {
            isRegister = register;
        }

        public String getNotifyType() {
            return notifyType;
        }

        public void setNotifyType(String notifyType) {
            this.notifyType = notifyType;
        }
    }

}