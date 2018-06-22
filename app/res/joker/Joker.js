/**
 * created by xiaweizi on 2018/6/21
 * function:
 * desc:
 */
import React, {Component} from 'react';
import {StyleSheet, ToastAndroid, FlatList, Dimensions} from 'react-native';
import {
    Container,
    Header,
    Body,
    Title,
    View,
    Text,
    Card,
    CardItem
} from 'native-base';
import Loading from '../utils/Loading'
import Color from "../utils/Color";
import Size from "../utils/Size";

const url = 'http://v.juhe.cn/joke/content/text.php?key=ae240f7fba620fc370b803566654949e&pagesize=10&page=';
const {width, height} = Dimensions.get('window');
export default class Joker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[
                // {
                //     content: '日老爸老妈因为某事吵个不休，我忍不住吼他们：“吵什么吵，都老夫老妻了，不能包容包容吗，我跟我男朋友就从来不吵，就不能学学我？”然后……他们反应过来后男女混合双打。为什么？因为家里不给早恋……………',
                //     updatetime: '2018-06-22 13:55:00',
                //     hashId: '43e7a60c0e7e8fcab5587edb3098870'
                // }
            ],
            refreshing: false,
            loadingVisible: true,
            page: 1,
        };
    };

    render() {
        return (
            <Container>
                <Header style={{backgroundColor: Color.main_color}} androidStatusBarColor={Color.main_color_primary}>
                    <Body>
                    <Title style={{marginLeft: Size.public_margin}}>段子</Title>
                    </Body>
                </Header>
                <View style={styles.container}>
                    <FlatList
                        data={this.state.data}
                        keyExtractor={this.keyExtractor}
                        renderItem={this.getView}

                        //下拉刷新，必须设置refreshing状态
                        onRefresh={this.onRefresh}
                        refreshing={this.state.refreshing}

                        //上拉加载
                        onEndReachedThreshold={0.1}
                        onEndReached={this.onLoadMore}
                    />
                    {
                        this.state.loadingVisible ? (
                            <Loading/>
                        ) : null
                    }
                </View>
            </Container>
        );
    }

    keyExtractor = (item, index) => item.hashId;

    onRefresh = () => {
        //设置刷新状态为正在刷新
        this.setState({
            refreshing: true,
            loadingVisible: true,
            page: 1
        });
       this.getData(1)
    };

    onLoadMore = (info: { distanceFromEnd: number }) => {
        this.setState({
            loadingVisible: true,
        });
        this.getData(this.state.page)
    };

    getView({item}) {
        //这里返回的就是每个Item
        return (
            <Card style={styles.joker_card}>
                <CardItem >
                    <Body>
                    <Text>
                        {item.content}
                    </Text>

                    <Text style={styles.joker_date}>
                        {item.updatetime}
                    </Text>
                    </Body>
                </CardItem>
            </Card>
        )
    };

    //渲染完成，请求网络数据
    componentDidMount() {
        this.getData(this.state.page);
    }

    getData(page) {
        console.log('Joker', "page:\t" + page);
        fetch(url + page)
            .then((response) => response.json())
            .then((response) => {
                //解析json数据
                this.onSuccess(response)
            })
            .catch((error) => {
                if (error) {
                    //网络错误处理
                    this.onFailed(error.getMessage())
                }
            });
    }

    onSuccess(response) {
        console.log('Joker', response);
        if (response.error_code == 0) {
            if (this.state.page == 1) {
                this.setState({
                    data: response.result.data,
                })
            } else {
                this.setState({
                    data: this.state.data.concat(response.result.data),
                })
            }

            let page = this.state.page + 1;
            this.setState({
                loadingVisible: false,
                refreshing: false,
                page: page
            })
        } else {
            this.onFailed(response.reason)
        }
    }

    onFailed(msg) {
        this.setState({
            loadingVisible: false,
            refreshing: false,
        });
        ToastAndroid.show(msg, ToastAndroid.SHORT)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    joker_card: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 6,
        width: width - Size.public_margin,
        marginRight: Size.public_margin
    },
    joker_date: {
        marginTop: Size.public_margin / 2,
        alignSelf: 'flex-end',
        color: Color.sub_text_colorm
    }
});