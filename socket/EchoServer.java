public class EchoServer {
    public static void main(String[] args) {
        int portNumber = 8888;
        ServerSocket serverSocket = null;
        Socket dataSocket = null;

        try {
            serverSocket = new ServerSocket(portNumber);
            System.out.println("Echo Server started on port " + portNumber);
            while (true) {
                dataSocket = serverSocket.accept();
                System.out.println("Client connected: " + dataSocket.getInetAddress());

            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
